const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mtAccount: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  volume: {
    type: Number,
    required: true
  },
  openPrice: {
    type: Number,
    required: true
  },
  closePrice: {
    type: Number
  },
  stopLoss: {
    type: Number,
    required: true
  },
  takeProfit: {
    type: Number,
    required: true
  },
  openTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  closeTime: {
    type: Date
  },
  profit: {
    type: Number,
    default: 0
  },
  commission: {
    type: Number,
    default: 0
  },
  swap: {
    type: Number,
    default: 0
  },
  modelPrediction: {
    confidence: {
      type: Number,
      default: 0
    },
    direction: {
      type: String,
      enum: ['BUY', 'SELL', 'NEUTRAL']
    },
    parameters: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED', 'PENDING'],
    default: 'OPEN'
  },
  mt5OrderId: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
TradeSchema.index({ userId: 1, status: 1 });
TradeSchema.index({ symbol: 1, openTime: -1 });
TradeSchema.index({ mtAccount: 1, status: 1 });

const Trade = mongoose.model('Trade', TradeSchema);

module.exports = Trade;
