import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Define types
interface MarketData {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  time: string;
  dailyChange: number;
  dailyChangePercent: number;
  high: number;
  low: number;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface MarketState {
  symbols: string[];
  currentSymbol: string;
  marketData: Record<string, MarketData>;
  candleData: Record<string, CandleData[]>;
  timeframe: string;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Initial state
const initialState: MarketState = {
  symbols: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD'],
  currentSymbol: 'EURUSD',
  marketData: {},
  candleData: {},
  timeframe: '5m',
  loading: false,
  error: null,
  lastUpdated: null,
};

// Create slice
const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    fetchMarketDataStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMarketDataSuccess: (state, action: PayloadAction<Record<string, MarketData>>) => {
      state.marketData = action.payload;
      state.loading = false;
      state.lastUpdated = new Date().toISOString();
    },
    fetchMarketDataFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchCandleDataStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCandleDataSuccess: (state, action: PayloadAction<{ symbol: string; data: CandleData[] }>) => {
      state.candleData[action.payload.symbol] = action.payload.data;
      state.loading = false;
      state.lastUpdated = new Date().toISOString();
    },
    fetchCandleDataFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentSymbol: (state, action: PayloadAction<string>) => {
      state.currentSymbol = action.payload;
    },
    setTimeframe: (state, action: PayloadAction<string>) => {
      state.timeframe = action.payload;
    },
    updateMarketData: (state, action: PayloadAction<{ symbol: string; data: MarketData }>) => {
      state.marketData[action.payload.symbol] = action.payload.data;
      state.lastUpdated = new Date().toISOString();
    },
    updateCandleData: (state, action: PayloadAction<{ symbol: string; candle: CandleData }>) => {
      const { symbol, candle } = action.payload;
      if (state.candleData[symbol]) {
        // Update the last candle if it has the same time, otherwise add a new one
        const lastIndex = state.candleData[symbol].length - 1;
        if (lastIndex >= 0 && state.candleData[symbol][lastIndex].time === candle.time) {
          state.candleData[symbol][lastIndex] = candle;
        } else {
          state.candleData[symbol].push(candle);
        }
      } else {
        state.candleData[symbol] = [candle];
      }
      state.lastUpdated = new Date().toISOString();
    },
  },
});

// Export actions
export const {
  fetchMarketDataStart,
  fetchMarketDataSuccess,
  fetchMarketDataFailure,
  fetchCandleDataStart,
  fetchCandleDataSuccess,
  fetchCandleDataFailure,
  setCurrentSymbol,
  setTimeframe,
  updateMarketData,
  updateCandleData,
} = marketSlice.actions;

// Export selectors
export const selectMarket = (state: RootState) => state.market;
export const selectCurrentSymbol = (state: RootState) => state.market.currentSymbol;
export const selectMarketData = (state: RootState) => state.market.marketData;
export const selectCandleData = (state: RootState) => state.market.candleData;
export const selectTimeframe = (state: RootState) => state.market.timeframe;

// Export reducer
export default marketSlice.reducer;
