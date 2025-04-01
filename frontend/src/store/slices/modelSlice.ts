import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Define types
interface ModelParameter {
  name: string;
  value: number | string | boolean;
  min?: number;
  max?: number;
  options?: string[];
  type: 'number' | 'string' | 'boolean' | 'select';
  description: string;
}

interface ModelFeature {
  name: string;
  enabled: boolean;
  description: string;
  parameters: ModelParameter[];
}

interface ModelState {
  features: ModelFeature[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  performance: {
    winRate: number;
    profitFactor: number;
    sharpeRatio: number;
    maxDrawdown: number;
    totalTrades: number;
    profitableTrades: number;
    averageProfit: number;
    averageLoss: number;
  };
}

// Initial state
const initialState: ModelState = {
  features: [
    {
      name: 'Deep Learning',
      enabled: true,
      description: 'Uses LSTM and Transformer neural networks for time series prediction',
      parameters: [
        {
          name: 'modelType',
          value: 'lstm',
          type: 'select',
          options: ['lstm', 'transformer'],
          description: 'Type of neural network to use'
        },
        {
          name: 'confidence',
          value: 0.7,
          min: 0.5,
          max: 0.95,
          type: 'number',
          description: 'Minimum confidence threshold for signals'
        }
      ]
    },
    {
      name: 'Sentiment Analysis',
      enabled: true,
      description: 'Analyzes market sentiment from news and economic events',
      parameters: [
        {
          name: 'useNewsData',
          value: true,
          type: 'boolean',
          description: 'Include news sentiment in analysis'
        },
        {
          name: 'useEconomicCalendar',
          value: true,
          type: 'boolean',
          description: 'Consider economic calendar events'
        }
      ]
    },
    {
      name: 'Advanced Risk Management',
      enabled: true,
      description: 'Dynamic position sizing and risk control',
      parameters: [
        {
          name: 'maxRiskPerTrade',
          value: 2.0,
          min: 0.5,
          max: 5.0,
          type: 'number',
          description: 'Maximum risk per trade as percentage of account'
        },
        {
          name: 'useKellyCriterion',
          value: true,
          type: 'boolean',
          description: 'Use Kelly Criterion for position sizing'
        },
        {
          name: 'kellyFraction',
          value: 0.5,
          min: 0.1,
          max: 1.0,
          type: 'number',
          description: 'Fraction of Kelly criterion to use (0-1)'
        }
      ]
    },
    {
      name: 'Adaptive Parameters',
      enabled: true,
      description: 'Adjusts trading parameters based on market conditions',
      parameters: [
        {
          name: 'detectMarketRegime',
          value: true,
          type: 'boolean',
          description: 'Detect market regime (trending, ranging, volatile)'
        },
        {
          name: 'adaptStopLoss',
          value: true,
          type: 'boolean',
          description: 'Adapt stop loss based on market volatility'
        }
      ]
    }
  ],
  loading: false,
  error: null,
  lastUpdated: null,
  performance: {
    winRate: 0,
    profitFactor: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    totalTrades: 0,
    profitableTrades: 0,
    averageProfit: 0,
    averageLoss: 0
  }
};

// Create slice
const modelSlice = createSlice({
  name: 'model',
  initialState,
  reducers: {
    fetchModelConfigStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchModelConfigSuccess: (state, action: PayloadAction<ModelFeature[]>) => {
      state.features = action.payload;
      state.loading = false;
      state.lastUpdated = new Date().toISOString();
    },
    fetchModelConfigFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateFeatureEnabled: (state, action: PayloadAction<{ featureName: string; enabled: boolean }>) => {
      const { featureName, enabled } = action.payload;
      const feature = state.features.find(f => f.name === featureName);
      if (feature) {
        feature.enabled = enabled;
        state.lastUpdated = new Date().toISOString();
      }
    },
    updateParameterValue: (state, action: PayloadAction<{ 
      featureName: string; 
      parameterName: string; 
      value: number | string | boolean 
    }>) => {
      const { featureName, parameterName, value } = action.payload;
      const feature = state.features.find(f => f.name === featureName);
      if (feature) {
        const parameter = feature.parameters.find(p => p.name === parameterName);
        if (parameter) {
          parameter.value = value;
          state.lastUpdated = new Date().toISOString();
        }
      }
    },
    fetchPerformanceStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPerformanceSuccess: (state, action: PayloadAction<{
      winRate: number;
      profitFactor: number;
      sharpeRatio: number;
      maxDrawdown: number;
      totalTrades: number;
      profitableTrades: number;
      averageProfit: number;
      averageLoss: number;
    }>) => {
      state.performance = action.payload;
      state.loading = false;
      state.lastUpdated = new Date().toISOString();
    },
    fetchPerformanceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    }
  },
});

// Export actions
export const {
  fetchModelConfigStart,
  fetchModelConfigSuccess,
  fetchModelConfigFailure,
  updateFeatureEnabled,
  updateParameterValue,
  fetchPerformanceStart,
  fetchPerformanceSuccess,
  fetchPerformanceFailure
} = modelSlice.actions;

// Export selectors
export const selectModel = (state: RootState) => state.model;
export const selectFeatures = (state: RootState) => state.model.features;
export const selectPerformance = (state: RootState) => state.model.performance;

// Export reducer
export default modelSlice.reducer;
