const { PythonShell } = require('python-shell');
const path = require('path');
const ModelPrediction = require('../models/modelPrediction.model');
const ModelConfig = require('../models/modelConfig.model');

// Path to the Python script for model operations
const MODEL_SCRIPT = path.join(__dirname, '../../scripts/run_model.py');

/**
 * Get model predictions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getModelPredictions = async (req, res) => {
  try {
    const { symbol, timeframe, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    
    if (symbol) query.symbol = symbol;
    if (timeframe) query.timeframe = timeframe;
    
    // Find predictions with pagination
    const predictions = await ModelPrediction.find(query)
      .sort({ predictionTime: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: predictions.length,
      predictions
    });
  } catch (error) {
    console.error('Get model predictions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Generate new model prediction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generatePrediction = async (req, res) => {
  try {
    const { symbol, timeframe } = req.body;
    
    if (!symbol || !timeframe) {
      return res.status(400).json({ 
        success: false, 
        message: 'Symbol and timeframe are required' 
      });
    }
    
    // Get user's model config
    const modelConfig = await ModelConfig.findOne({ userId: req.user.id });
    
    if (!modelConfig) {
      return res.status(404).json({ 
        success: false, 
        message: 'Model configuration not found' 
      });
    }
    
    // Check if symbol is enabled in config
    if (!modelConfig.symbols.includes(symbol)) {
      return res.status(400).json({ 
        success: false, 
        message: `Symbol ${symbol} is not enabled in your configuration` 
      });
    }
    
    // Check if timeframe is enabled in config
    if (!modelConfig.timeframes.includes(timeframe)) {
      return res.status(400).json({ 
        success: false, 
        message: `Timeframe ${timeframe} is not enabled in your configuration` 
      });
    }
    
    // Prepare feature configuration
    const features = {};
    modelConfig.features.forEach(feature => {
      features[feature.name] = {
        enabled: feature.enabled,
        parameters: {}
      };
      
      feature.parameters.forEach(param => {
        features[feature.name].parameters[param.name] = param.value;
      });
    });
    
    // Execute model prediction using Python script
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(MODEL_SCRIPT),
      args: [
        symbol,
        timeframe,
        JSON.stringify(features),
        JSON.stringify(modelConfig.riskSettings)
      ]
    };
    
    PythonShell.run(path.basename(MODEL_SCRIPT), options, async (err, results) => {
      if (err) {
        console.error('Model prediction error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Model prediction failed. Execution error.' 
        });
      }
      
      // Parse the result from the Python script
      const predictionResult = JSON.parse(results[0]);
      
      if (!predictionResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: predictionResult.message || 'Model prediction failed' 
        });
      }
      
      // Create prediction record in database
      const prediction = new ModelPrediction({
        symbol,
        timeframe,
        predictionTime: new Date(),
        direction: predictionResult.direction,
        confidence: predictionResult.confidence,
        entryPrice: predictionResult.entryPrice,
        stopLoss: predictionResult.stopLoss,
        takeProfit: predictionResult.takeProfit,
        riskReward: predictionResult.riskReward,
        parameters: predictionResult.parameters,
        marketRegime: predictionResult.marketRegime,
        sentimentScore: predictionResult.sentimentScore,
        features: {
          deepLearning: features['Deep Learning']?.enabled || false,
          sentiment: features['Sentiment Analysis']?.enabled || false,
          advancedRisk: features['Advanced Risk Management']?.enabled || false,
          adaptiveParameters: features['Adaptive Parameters']?.enabled || false
        }
      });
      
      await prediction.save();
      
      res.status(201).json({
        success: true,
        message: 'Prediction generated successfully',
        prediction
      });
    });
  } catch (error) {
    console.error('Generate prediction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get model performance metrics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getModelPerformance = async (req, res) => {
  try {
    const { period } = req.query;
    
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
    
    // Find predictions with outcomes
    const predictions = await ModelPrediction.find({
      predictionTime: { $gte: startDate, $lte: endDate },
      actualOutcome: { $in: ['SUCCESS', 'FAILURE'] }
    });
    
    // Calculate performance metrics
    const totalPredictions = predictions.length;
    const successfulPredictions = predictions.filter(p => p.actualOutcome === 'SUCCESS').length;
    
    // Calculate win rate
    const winRate = totalPredictions > 0 ? successfulPredictions / totalPredictions : 0;
    
    // Calculate average profit in pips
    const averageProfit = successfulPredictions > 0 
      ? predictions.filter(p => p.actualOutcome === 'SUCCESS').reduce((sum, p) => sum + p.profitPips, 0) / successfulPredictions 
      : 0;
    
    // Calculate average loss in pips
    const averageLoss = (totalPredictions - successfulPredictions) > 0 
      ? predictions.filter(p => p.actualOutcome === 'FAILURE').reduce((sum, p) => sum + p.profitPips, 0) / (totalPredictions - successfulPredictions) 
      : 0;
    
    // Calculate profit factor
    const grossProfit = predictions.filter(p => p.actualOutcome === 'SUCCESS').reduce((sum, p) => sum + p.profitPips, 0);
    const grossLoss = Math.abs(predictions.filter(p => p.actualOutcome === 'FAILURE').reduce((sum, p) => sum + p.profitPips, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    
    // Calculate Sharpe ratio (simplified)
    let returns = [];
    let prevDate = null;
    let dailyReturn = 0;
    
    // Group by day and calculate daily returns
    predictions.sort((a, b) => a.predictionTime - b.predictionTime).forEach(prediction => {
      const date = new Date(prediction.predictionTime);
      date.setHours(0, 0, 0, 0);
      
      if (prevDate && date.getTime() !== prevDate.getTime()) {
        returns.push(dailyReturn);
        dailyReturn = 0;
      }
      
      dailyReturn += prediction.profitPips;
      prevDate = date;
    });
    
    if (dailyReturn !== 0) {
      returns.push(dailyReturn);
    }
    
    // Calculate mean and standard deviation of returns
    const meanReturn = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0;
    const stdDeviation = returns.length > 0 
      ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length) 
      : 1;
    
    // Calculate Sharpe ratio (assuming risk-free rate of 0)
    const sharpeRatio = stdDeviation > 0 ? (meanReturn / stdDeviation) * Math.sqrt(252) : 0; // Annualized
    
    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let runningTotal = 0;
    
    predictions.sort((a, b) => a.predictionTime - b.predictionTime).forEach(prediction => {
      runningTotal += prediction.profitPips;
      
      if (runningTotal > peak) {
        peak = runningTotal;
      }
      
      const drawdown = peak - runningTotal;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });
    
    // Prepare response
    const performance = {
      period,
      totalPredictions,
      successfulPredictions,
      winRate,
      averageProfit,
      averageLoss,
      profitFactor,
      sharpeRatio,
      maxDrawdown,
      startDate,
      endDate
    };
    
    res.status(200).json({
      success: true,
      performance
    });
  } catch (error) {
    console.error('Get model performance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get model configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getModelConfig = async (req, res) => {
  try {
    // Find model config for user
    let modelConfig = await ModelConfig.findOne({ userId: req.user.id });
    
    // If no config exists, create default
    if (!modelConfig) {
      modelConfig = await ModelConfig.createDefaultConfig(req.user.id);
    }
    
    res.status(200).json({
      success: true,
      modelConfig
    });
  } catch (error) {
    console.error('Get model config error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Update model configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateModelConfig = async (req, res) => {
  try {
    const { features, symbols, timeframes, riskSettings } = req.body;
    
    // Find model config for user
    let modelConfig = await ModelConfig.findOne({ userId: req.user.id });
    
    // If no config exists, create default
    if (!modelConfig) {
      modelConfig = await ModelConfig.createDefaultConfig(req.user.id);
    }
    
    // Update fields
    if (features) modelConfig.features = features;
    if (symbols) modelConfig.symbols = symbols;
    if (timeframes) modelConfig.timeframes = timeframes;
    if (riskSettings) {
      modelConfig.riskSettings = {
        ...modelConfig.riskSettings,
        ...riskSettings
      };
    }
    
    modelConfig.lastUpdated = new Date();
    
    // Save updated config
    await modelConfig.save();
    
    res.status(200).json({
      success: true,
      message: 'Model configuration updated successfully',
      modelConfig
    });
  } catch (error) {
    console.error('Update model config error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
