const { PythonShell } = require('python-shell');
const path = require('path');
const Trade = require('../models/trade.model');
const ModelPrediction = require('../models/modelPrediction.model');
const ModelConfig = require('../models/modelConfig.model');

// Path to the Python script for trading operations
const MT5_TRADE_SCRIPT = path.join(__dirname, '../../scripts/mt5_trade.py');

/**
 * Get open positions for the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getOpenPositions = async (req, res) => {
  try {
    const { mtAccount } = req.query;
    
    // Build query
    const query = { 
      userId: req.user.id,
      status: 'OPEN'
    };
    
    if (mtAccount) {
      query.mtAccount = mtAccount;
    }
    
    // Find open trades
    const trades = await Trade.find(query).sort({ openTime: -1 });
    
    res.status(200).json({
      success: true,
      count: trades.length,
      trades
    });
  } catch (error) {
    console.error('Get open positions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get trade history for the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTradeHistory = async (req, res) => {
  try {
    const { mtAccount, symbol, startDate, endDate, limit = 50, page = 1 } = req.query;
    
    // Build query
    const query = { 
      userId: req.user.id,
      status: 'CLOSED'
    };
    
    if (mtAccount) query.mtAccount = mtAccount;
    if (symbol) query.symbol = symbol;
    
    // Date filtering
    if (startDate || endDate) {
      query.closeTime = {};
      if (startDate) query.closeTime.$gte = new Date(startDate);
      if (endDate) query.closeTime.$lte = new Date(endDate);
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find closed trades with pagination
    const trades = await Trade.find(query)
      .sort({ closeTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalCount = await Trade.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: trades.length,
      totalCount,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      trades
    });
  } catch (error) {
    console.error('Get trade history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Place a new trade
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.placeTrade = async (req, res) => {
  try {
    const { 
      mtAccount, 
      server,
      symbol, 
      type, 
      volume, 
      openPrice, 
      stopLoss, 
      takeProfit,
      modelPredictionId
    } = req.body;
    
    if (!mtAccount || !server || !symbol || !type || !volume) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required trade parameters' 
      });
    }
    
    // Get model prediction if provided
    let modelPrediction = null;
    if (modelPredictionId) {
      modelPrediction = await ModelPrediction.findById(modelPredictionId);
    }
    
    // Get user's model config for risk settings
    const modelConfig = await ModelConfig.findOne({ userId: req.user.id });
    
    // Check if max open trades limit is reached
    const openTradesCount = await Trade.countDocuments({ 
      userId: req.user.id,
      mtAccount,
      status: 'OPEN'
    });
    
    if (modelConfig && openTradesCount >= modelConfig.riskSettings.maxOpenTrades) {
      return res.status(400).json({ 
        success: false, 
        message: `Maximum open trades limit (${modelConfig.riskSettings.maxOpenTrades}) reached` 
      });
    }
    
    // Execute trade using MT5 Python script
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(MT5_TRADE_SCRIPT),
      args: [
        server,
        mtAccount,
        req.user.mtPassword, // This should be securely stored or passed from auth middleware
        symbol,
        type,
        volume.toString(),
        openPrice ? openPrice.toString() : '0', // 0 means market price
        stopLoss ? stopLoss.toString() : '0',
        takeProfit ? takeProfit.toString() : '0'
      ]
    };
    
    PythonShell.run(path.basename(MT5_TRADE_SCRIPT), options, async (err, results) => {
      if (err) {
        console.error('MT5 trade execution error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Trade execution failed. MT5 connection error.' 
        });
      }
      
      // Parse the result from the Python script
      const tradeResult = JSON.parse(results[0]);
      
      if (!tradeResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: tradeResult.message || 'Trade execution failed' 
        });
      }
      
      // Create trade record in database
      const trade = new Trade({
        userId: req.user.id,
        mtAccount,
        symbol,
        type,
        volume,
        openPrice: tradeResult.openPrice || openPrice,
        stopLoss: tradeResult.stopLoss || stopLoss,
        takeProfit: tradeResult.takeProfit || takeProfit,
        openTime: new Date(),
        status: 'OPEN',
        mt5OrderId: tradeResult.orderId,
        modelPrediction: modelPrediction ? {
          confidence: modelPrediction.confidence,
          direction: modelPrediction.direction,
          parameters: modelPrediction.parameters
        } : undefined
      });
      
      await trade.save();
      
      res.status(201).json({
        success: true,
        message: 'Trade placed successfully',
        trade
      });
    });
  } catch (error) {
    console.error('Place trade error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Close an open trade
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.closeTrade = async (req, res) => {
  try {
    const { tradeId } = req.params;
    
    // Find the trade
    const trade = await Trade.findOne({ 
      _id: tradeId,
      userId: req.user.id,
      status: 'OPEN'
    });
    
    if (!trade) {
      return res.status(404).json({ 
        success: false, 
        message: 'Trade not found or already closed' 
      });
    }
    
    // Execute close trade using MT5 Python script
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(MT5_TRADE_SCRIPT),
      args: [
        trade.server,
        trade.mtAccount,
        req.user.mtPassword, // This should be securely stored or passed from auth middleware
        'CLOSE',
        trade.mt5OrderId
      ]
    };
    
    PythonShell.run(path.basename(MT5_TRADE_SCRIPT), options, async (err, results) => {
      if (err) {
        console.error('MT5 trade close error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Trade close failed. MT5 connection error.' 
        });
      }
      
      // Parse the result from the Python script
      const closeResult = JSON.parse(results[0]);
      
      if (!closeResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: closeResult.message || 'Trade close failed' 
        });
      }
      
      // Update trade record
      trade.status = 'CLOSED';
      trade.closeTime = new Date();
      trade.closePrice = closeResult.closePrice;
      trade.profit = closeResult.profit;
      trade.commission = closeResult.commission;
      trade.swap = closeResult.swap;
      
      await trade.save();
      
      // If this trade was based on a model prediction, update the prediction outcome
      if (trade.modelPrediction) {
        const prediction = await ModelPrediction.findOne({
          symbol: trade.symbol,
          direction: trade.modelPrediction.direction,
          confidence: trade.modelPrediction.confidence,
          predictionTime: { $lt: trade.openTime }
        }).sort({ predictionTime: -1 });
        
        if (prediction) {
          const isSuccess = (trade.type === 'BUY' && trade.profit > 0) || 
                           (trade.type === 'SELL' && trade.profit > 0);
          
          prediction.actualOutcome = isSuccess ? 'SUCCESS' : 'FAILURE';
          prediction.profitPips = trade.profit / trade.volume / 10; // Approximate pips calculation
          
          await prediction.save();
        }
      }
      
      res.status(200).json({
        success: true,
        message: 'Trade closed successfully',
        trade
      });
    });
  } catch (error) {
    console.error('Close trade error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Modify an existing trade (stop loss, take profit)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.modifyTrade = async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { stopLoss, takeProfit } = req.body;
    
    if (!stopLoss && !takeProfit) {
      return res.status(400).json({ 
        success: false, 
        message: 'No modification parameters provided' 
      });
    }
    
    // Find the trade
    const trade = await Trade.findOne({ 
      _id: tradeId,
      userId: req.user.id,
      status: 'OPEN'
    });
    
    if (!trade) {
      return res.status(404).json({ 
        success: false, 
        message: 'Trade not found or already closed' 
      });
    }
    
    // Execute modify trade using MT5 Python script
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(MT5_TRADE_SCRIPT),
      args: [
        trade.server,
        trade.mtAccount,
        req.user.mtPassword, // This should be securely stored or passed from auth middleware
        'MODIFY',
        trade.mt5OrderId,
        stopLoss ? stopLoss.toString() : trade.stopLoss.toString(),
        takeProfit ? takeProfit.toString() : trade.takeProfit.toString()
      ]
    };
    
    PythonShell.run(path.basename(MT5_TRADE_SCRIPT), options, async (err, results) => {
      if (err) {
        console.error('MT5 trade modify error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Trade modification failed. MT5 connection error.' 
        });
      }
      
      // Parse the result from the Python script
      const modifyResult = JSON.parse(results[0]);
      
      if (!modifyResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: modifyResult.message || 'Trade modification failed' 
        });
      }
      
      // Update trade record
      if (stopLoss) trade.stopLoss = stopLoss;
      if (takeProfit) trade.takeProfit = takeProfit;
      
      await trade.save();
      
      res.status(200).json({
        success: true,
        message: 'Trade modified successfully',
        trade
      });
    });
  } catch (error) {
    console.error('Modify trade error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get trade performance statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTradeStats = async (req, res) => {
  try {
    const { mtAccount, period } = req.query;
    
    // Determine date range based on period
    const endDate = new Date();
    let startDate = new Date();
    
    switch(period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        // Default to all time
        startDate = new Date(0);
    }
    
    // Build query
    const query = { 
      userId: req.user.id,
      status: 'CLOSED',
      closeTime: { $gte: startDate, $lte: endDate }
    };
    
    if (mtAccount) {
      query.mtAccount = mtAccount;
    }
    
    // Find closed trades
    const trades = await Trade.find(query);
    
    // Calculate statistics
    const totalTrades = trades.length;
    const profitableTrades = trades.filter(t => t.profit > 0).length;
    const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
    const totalCommission = trades.reduce((sum, t) => sum + t.commission, 0);
    const totalSwap = trades.reduce((sum, t) => sum + t.swap, 0);
    const netProfit = totalProfit - totalCommission - totalSwap;
    
    // Calculate win rate and average values
    const winRate = totalTrades > 0 ? profitableTrades / totalTrades : 0;
    const averageProfit = profitableTrades > 0 
      ? trades.filter(t => t.profit > 0).reduce((sum, t) => sum + t.profit, 0) / profitableTrades 
      : 0;
    const averageLoss = (totalTrades - profitableTrades) > 0 
      ? trades.filter(t => t.profit <= 0).reduce((sum, t) => sum + t.profit, 0) / (totalTrades - profitableTrades) 
      : 0;
    
    // Calculate profit factor
    const grossProfit = trades.filter(t => t.profit > 0).reduce((sum, t) => sum + t.profit, 0);
    const grossLoss = Math.abs(trades.filter(t => t.profit <= 0).reduce((sum, t) => sum + t.profit, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    
    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let runningTotal = 0;
    
    trades.sort((a, b) => a.closeTime - b.closeTime).forEach(trade => {
      runningTotal += trade.profit;
      
      if (runningTotal > peak) {
        peak = runningTotal;
      }
      
      const drawdown = peak - runningTotal;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });
    
    // Calculate max drawdown percentage
    const maxDrawdownPercent = peak > 0 ? (maxDrawdown / peak) * 100 : 0;
    
    // Prepare response
    const stats = {
      period,
      totalTrades,
      profitableTrades,
      winRate,
      totalProfit,
      netProfit,
      totalCommission,
      totalSwap,
      averageProfit,
      averageLoss,
      profitFactor,
      maxDrawdown,
      maxDrawdownPercent,
      startDate,
      endDate
    };
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get trade stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
