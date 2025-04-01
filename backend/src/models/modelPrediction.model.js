const mongoose = require('mongoose');

const ModelPredictionSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true
  },
  timeframe: {
    type: String,
    required: true
  },
  predictionTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  direction: {
    type: String,
    enum: ['BUY', 'SELL', 'NEUTRAL'],
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  entryPrice: {
    type: Number,
    required: true
  },
  stopLoss: {
    type: Number,
    required: true
  },
  takeProfit: {
    type: Number,
    required: true
  },
  riskReward: {
    type: Number,
    required: true
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed
  },
  marketRegime: {
    type: String,
    enum: ['TRENDING', 'RANGING', 'VOLATILE', 'UNKNOWN'],
    default: 'UNKNOWN'
  },
  sentimentScore: {
    type: Number,
    min: -1,
    max: 1
  },
  actualOutcome: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'PENDING', 'UNKNOWN'],
    default: 'PENDING'
  },
  profitPips: {
    type: Number,
    default: 0
  },
  features: {
    deepLearning: {
      type: Boolean,
      default: true
    },
    sentiment: {
      type: Boolean,
      default: true
    },
    advancedRisk: {
      type: Boolean,
      default: true
    },
    adaptiveParameters: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for faster queries
ModelPredictionSchema.index({ symbol: 1, predictionTime: -1 });
ModelPredictionSchema.index({ direction: 1, confidence: -1 });
ModelPredictionSchema.index({ actualOutcome: 1 });

const ModelPrediction = mongoose.model('ModelPrediction', ModelPredictionSchema);

module.exports = ModelPrediction;
