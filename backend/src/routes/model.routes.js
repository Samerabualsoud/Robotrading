const express = require('express');
const router = express.Router();
const modelController = require('../controllers/model.controller');

// GET /api/model/predictions - Get model predictions
router.get('/predictions', modelController.getModelPredictions);

// POST /api/model/predictions - Generate new model prediction
router.post('/predictions', modelController.generatePrediction);

// GET /api/model/performance - Get model performance metrics
router.get('/performance', modelController.getModelPerformance);

// GET /api/model/config - Get model configuration
router.get('/config', modelController.getModelConfig);

// PUT /api/model/config - Update model configuration
router.put('/config', modelController.updateModelConfig);

module.exports = router;
