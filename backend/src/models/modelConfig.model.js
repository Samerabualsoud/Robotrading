const mongoose = require('mongoose');

const ModelConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  features: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    enabled: {
      type: Boolean,
      default: true
    },
    parameters: [{
      name: {
        type: String,
        required: true
      },
      description: {
        type: String
      },
      type: {
        type: String,
        enum: ['number', 'boolean', 'string', 'select'],
        required: true
      },
      value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      min: {
        type: Number
      },
      max: {
        type: Number
      },
      options: [{
        type: String
      }]
    }]
  }],
  symbols: [{
    type: String,
    required: true
  }],
  timeframes: [{
    type: String,
    required: true
  }],
  riskSettings: {
    maxRiskPerTrade: {
      type: Number,
      default: 2.0 // percentage
    },
    maxOpenTrades: {
      type: Number,
      default: 5
    },
    maxDailyDrawdown: {
      type: Number,
      default: 5.0 // percentage
    },
    tradingHours: {
      start: {
        type: String,
        default: "00:00"
      },
      end: {
        type: String,
        default: "23:59"
      },
      timezone: {
        type: String,
        default: "UTC"
      }
    },
    weekendTrading: {
      type: Boolean,
      default: false
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a default configuration for new users
ModelConfigSchema.statics.createDefaultConfig = async function(userId) {
  const defaultConfig = {
    userId,
    features: [
      {
        name: "Deep Learning",
        description: "Neural network models for price prediction",
        enabled: true,
        parameters: [
          {
            name: "modelType",
            description: "Type of neural network to use",
            type: "select",
            value: "LSTM",
            options: ["LSTM", "Transformer", "Ensemble"]
          },
          {
            name: "lookbackPeriod",
            description: "Number of periods to look back for prediction",
            type: "number",
            value: 60,
            min: 10,
            max: 200
          },
          {
            name: "confidenceThreshold",
            description: "Minimum confidence level to generate signals",
            type: "number",
            value: 0.7,
            min: 0.5,
            max: 0.95
          }
        ]
      },
      {
        name: "Sentiment Analysis",
        description: "Market sentiment integration from news and social media",
        enabled: true,
        parameters: [
          {
            name: "includeSocialMedia",
            description: "Include social media sentiment in analysis",
            type: "boolean",
            value: true
          },
          {
            name: "includeNewsEvents",
            description: "Include economic news events in analysis",
            type: "boolean",
            value: true
          },
          {
            name: "sentimentWeight",
            description: "Weight of sentiment in overall prediction",
            type: "number",
            value: 0.3,
            min: 0.1,
            max: 0.5
          }
        ]
      },
      {
        name: "Advanced Risk Management",
        description: "Dynamic position sizing and risk control",
        enabled: true,
        parameters: [
          {
            name: "useKellyCriterion",
            description: "Use Kelly Criterion for position sizing",
            type: "boolean",
            value: true
          },
          {
            name: "dynamicStopLoss",
            description: "Adjust stop loss based on volatility",
            type: "boolean",
            value: true
          },
          {
            name: "riskRewardMinimum",
            description: "Minimum risk-reward ratio for trades",
            type: "number",
            value: 1.5,
            min: 1.0,
            max: 3.0
          }
        ]
      },
      {
        name: "Adaptive Parameters",
        description: "Self-adjusting parameters based on market conditions",
        enabled: true,
        parameters: [
          {
            name: "marketRegimeDetection",
            description: "Detect and adapt to market regimes",
            type: "boolean",
            value: true
          },
          {
            name: "volatilityAdjustment",
            description: "Adjust parameters based on volatility",
            type: "boolean",
            value: true
          },
          {
            name: "adaptationSpeed",
            description: "Speed of parameter adaptation",
            type: "number",
            value: 0.5,
            min: 0.1,
            max: 1.0
          }
        ]
      }
    ],
    symbols: ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD"],
    timeframes: ["1m", "5m", "15m", "30m", "1h", "4h", "1d"],
    riskSettings: {
      maxRiskPerTrade: 2.0,
      maxOpenTrades: 5,
      maxDailyDrawdown: 5.0,
      tradingHours: {
        start: "00:00",
        end: "23:59",
        timezone: "UTC"
      },
      weekendTrading: false
    }
  };
  
  return this.create(defaultConfig);
};

const ModelConfig = mongoose.model('ModelConfig', ModelConfigSchema);

module.exports = ModelConfig;
