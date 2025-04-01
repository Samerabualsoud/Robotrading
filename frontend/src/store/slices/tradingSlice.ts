import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Define types
interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  openTime: string;
  closeTime?: string;
  openPrice: number;
  closePrice?: number;
  volume: number;
  stopLoss: number;
  takeProfit: number;
  profit?: number;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  modelConfidence: number;
}

interface Position {
  symbol: string;
  type: 'BUY' | 'SELL';
  openPrice: number;
  currentPrice: number;
  volume: number;
  stopLoss: number;
  takeProfit: number;
  profit: number;
  swap: number;
  commission: number;
  openTime: string;
}

interface TradingState {
  trades: Trade[];
  positions: Position[];
  pendingOrders: Trade[];
  history: Trade[];
  loading: boolean;
  error: string | null;
  modelPredictions: {
    symbol: string;
    direction: 'BUY' | 'SELL' | 'NEUTRAL';
    confidence: number;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    timestamp: string;
  }[];
}

// Initial state
const initialState: TradingState = {
  trades: [],
  positions: [],
  pendingOrders: [],
  history: [],
  loading: false,
  error: null,
  modelPredictions: [],
};

// Create slice
const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    fetchTradesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTradesSuccess: (state, action: PayloadAction<Trade[]>) => {
      state.trades = action.payload;
      state.loading = false;
    },
    fetchTradesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchPositionsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPositionsSuccess: (state, action: PayloadAction<Position[]>) => {
      state.positions = action.payload;
      state.loading = false;
    },
    fetchPositionsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchHistoryStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchHistorySuccess: (state, action: PayloadAction<Trade[]>) => {
      state.history = action.payload;
      state.loading = false;
    },
    fetchHistoryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    placeTrade: (state, action: PayloadAction<Omit<Trade, 'id' | 'status'>>) => {
      state.loading = true;
      state.error = null;
    },
    placeTradeSuccess: (state, action: PayloadAction<Trade>) => {
      state.trades.push(action.payload);
      if (action.payload.status === 'OPEN') {
        state.positions.push({
          symbol: action.payload.symbol,
          type: action.payload.type,
          openPrice: action.payload.openPrice,
          currentPrice: action.payload.openPrice,
          volume: action.payload.volume,
          stopLoss: action.payload.stopLoss,
          takeProfit: action.payload.takeProfit,
          profit: 0,
          swap: 0,
          commission: 0,
          openTime: action.payload.openTime,
        });
      } else if (action.payload.status === 'PENDING') {
        state.pendingOrders.push(action.payload);
      }
      state.loading = false;
    },
    placeTradeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    closeTrade: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    closeTradeSuccess: (state, action: PayloadAction<Trade>) => {
      // Update the trade in the trades array
      const tradeIndex = state.trades.findIndex(t => t.id === action.payload.id);
      if (tradeIndex !== -1) {
        state.trades[tradeIndex] = action.payload;
      }
      
      // Remove from positions if it was open
      const positionIndex = state.positions.findIndex(
        p => p.symbol === action.payload.symbol && 
             p.type === action.payload.type && 
             p.openTime === action.payload.openTime
      );
      if (positionIndex !== -1) {
        state.positions.splice(positionIndex, 1);
      }
      
      // Add to history
      state.history.push(action.payload);
      
      state.loading = false;
    },
    closeTradeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updatePosition: (state, action: PayloadAction<Partial<Position> & { symbol: string; openTime: string }>) => {
      const { symbol, openTime, ...updates } = action.payload;
      const positionIndex = state.positions.findIndex(
        p => p.symbol === symbol && p.openTime === openTime
      );
      if (positionIndex !== -1) {
        state.positions[positionIndex] = {
          ...state.positions[positionIndex],
          ...updates,
        };
      }
    },
    addModelPrediction: (state, action: PayloadAction<{
      symbol: string;
      direction: 'BUY' | 'SELL' | 'NEUTRAL';
      confidence: number;
      entryPrice: number;
      stopLoss: number;
      takeProfit: number;
      timestamp: string;
    }>) => {
      // Add new prediction at the beginning of the array
      state.modelPredictions.unshift(action.payload);
      
      // Keep only the latest 100 predictions
      if (state.modelPredictions.length > 100) {
        state.modelPredictions = state.modelPredictions.slice(0, 100);
      }
    },
  },
});

// Export actions
export const {
  fetchTradesStart,
  fetchTradesSuccess,
  fetchTradesFailure,
  fetchPositionsStart,
  fetchPositionsSuccess,
  fetchPositionsFailure,
  fetchHistoryStart,
  fetchHistorySuccess,
  fetchHistoryFailure,
  placeTrade,
  placeTradeSuccess,
  placeTradeFailure,
  closeTrade,
  closeTradeSuccess,
  closeTradeFailure,
  updatePosition,
  addModelPrediction,
} = tradingSlice.actions;

// Export selectors
export const selectTrading = (state: RootState) => state.trading;
export const selectTrades = (state: RootState) => state.trading.trades;
export const selectPositions = (state: RootState) => state.trading.positions;
export const selectHistory = (state: RootState) => state.trading.history;
export const selectModelPredictions = (state: RootState) => state.trading.modelPredictions;

// Export reducer
export default tradingSlice.reducer;
