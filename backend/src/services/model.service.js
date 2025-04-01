const { PythonShell } = require('python-shell');
const path = require('path');
const socketService = require('./socket.service');
const ModelPrediction = require('../models/modelPrediction.model');

// Path to the Python script for model operations
const MODEL_SCRIPT = path.join(__dirname, '../../scripts/run_model.py');

// Store active model instances
const activeModels = new Map();

/**
 * Initialize model service
 */
exports.init = () => {
  console.log('Initializing model service...');
};

/**
 * Run model prediction
 * @param {string} symbol - Symbol
 * @param {string} timeframe - Timeframe
 * @param {Object} features - Model features configuration
 * @param {Object} riskSettings - Risk management settings
 * @returns {Promise<Object>} Prediction result
 */
exports.runPrediction = (symbol, timeframe, features, riskSettings) => {
  return new Promise((resolve, reject) => {
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
        JSON.stringify(riskSettings)
      ]
    };
    
    PythonShell.run(path.basename(MODEL_SCRIPT), options, async (err, results) => {
      if (err) {
        console.error('Model prediction error:', err);
        return reject({
          success: false,
          message: 'Model prediction failed. Execution error.'
        });
      }
      
      // Parse the result from the Python script
      const predictionResult = JSON.parse(results[0]);
      
      if (!predictionResult.success) {
        return reject({
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
      
      // Emit prediction to subscribed clients
      socketService.emitPrediction(symbol, prediction);
      
      // Return prediction
      resolve({
        success: true,
        prediction
      });
    });
  });
};

/**
 * Start automated trading for a user
 * @param {string} userId - User ID
 * @param {string} connectionId - MT5 connection ID
 * @param {Object} modelConfig - Model configuration
 * @returns {Promise<Object>} Start result
 */
exports.startAutomatedTrading = (userId, connectionId, modelConfig) => {
  return new Promise((resolve, reject) => {
    // Check if already running
    if (activeModels.has(userId)) {
      return resolve({
        success: true,
        message: 'Automated trading already running',
        modelId: activeModels.get(userId).modelId
      });
    }
    
    // Generate unique model ID
    const modelId = `model_${userId}_${Date.now()}`;
    
    // Execute model automation using Python script
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(MODEL_SCRIPT),
      args: [
        'START_AUTO',
        connectionId,
        userId,
        JSON.stringify(modelConfig)
      ]
    };
    
    PythonShell.run(path.basename(MODEL_SCRIPT), options, (err, results) => {
      if (err) {
        console.error('Start automated trading error:', err);
        return reject({
          success: false,
          message: 'Start automated trading failed. Execution error.'
        });
      }
      
      // Parse the result from the Python script
      const startResult = JSON.parse(results[0]);
      
      if (!startResult.success) {
        return reject({
          success: false,
          message: startResult.message || 'Start automated trading failed'
        });
      }
      
      // Store active model
      activeModels.set(userId, {
        modelId,
        connectionId,
        config: modelConfig,
        startTime: new Date()
      });
      
      // Emit model started event to user
      socketService.emitToUser(userId, 'model_started', {
        success: true,
        modelId,
        config: modelConfig
      });
      
      // Return success
      resolve({
        success: true,
        message: 'Automated trading started successfully',
        modelId
      });
    });
  });
};

/**
 * Stop automated trading for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Stop result
 */
exports.stopAutomatedTrading = (userId) => {
  return new Promise((resolve, reject) => {
    // Check if running
    if (!activeModels.has(userId)) {
      return resolve({
        success: true,
        message: 'Automated trading not running'
      });
    }
    
    const model = activeModels.get(userId);
    
    // Execute model stop using Python script
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(MODEL_SCRIPT),
      args: [
        'STOP_AUTO',
        model.connectionId,
        userId
      ]
    };
    
    PythonShell.run(path.basename(MODEL_SCRIPT), options, (err, results) => {
      if (err) {
        console.error('Stop automated trading error:', err);
        return reject({
          success: false,
          message: 'Stop automated trading failed. Execution error.'
        });
      }
      
      // Parse the result from the Python script
      const stopResult = JSON.parse(results[0]);
      
      if (!stopResult.success) {
        return reject({
          success: false,
          message: stopResult.message || 'Stop automated trading failed'
        });
      }
      
      // Remove active model
      activeModels.delete(userId);
      
      // Emit model stopped event to user
      socketService.emitToUser(userId, 'model_stopped', {
        success: true,
        modelId: model.modelId
      });
      
      // Return success
      resolve({
        success: true,
        message: 'Automated trading stopped successfully'
      });
    });
  });
};

/**
 * Get model status for a user
 * @param {string} userId - User ID
 * @returns {Object} Model status
 */
exports.getModelStatus = (userId) => {
  if (activeModels.has(userId)) {
    const model = activeModels.get(userId);
    return {
      running: true,
      modelId: model.modelId,
      startTime: model.startTime,
      config: model.config
    };
  } else {
    return {
      running: false
    };
  }
};

/**
 * Shutdown model service
 */
exports.shutdown = () => {
  console.log('Shutting down model service...');
  
  // Stop all active models
  for (const userId of activeModels.keys()) {
    this.stopAutomatedTrading(userId).catch(err => {
      console.error(`Error stopping model for user ${userId}:`, err);
    });
  }
};
