import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import TradingDashboard from '../src/pages/TradingDashboard';
import { fetchMarketData, startMarketDataStream } from '../src/store/slices/marketSlice';
import { fetchOpenPositions } from '../src/store/slices/tradingSlice';
import { fetchModelPredictions, generatePrediction } from '../src/store/slices/modelSlice';

// Mock Redux store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock the actions
jest.mock('../src/store/slices/marketSlice', () => ({
  fetchMarketData: jest.fn(),
  startMarketDataStream: jest.fn()
}));

jest.mock('../src/store/slices/tradingSlice', () => ({
  fetchOpenPositions: jest.fn()
}));

jest.mock('../src/store/slices/modelSlice', () => ({
  fetchModelPredictions: jest.fn(),
  generatePrediction: jest.fn()
}));

describe('TradingDashboard Component', () => {
  let store;

  beforeEach(() => {
    // Create mock data
    const marketData = [
      {
        time: '2025-04-01T10:00:00',
        open: 1.2000,
        high: 1.2050,
        low: 1.1950,
        close: 1.2025,
        tick_volume: 1000,
        spread: 2,
        real_volume: 10000
      },
      {
        time: '2025-04-01T10:05:00',
        open: 1.2025,
        high: 1.2075,
        low: 1.2000,
        close: 1.2050,
        tick_volume: 1200,
        spread: 2,
        real_volume: 12000
      }
    ];

    const openPositions = [
      {
        ticket: 123456,
        time: '2025-04-01T09:30:00',
        type: 'BUY',
        symbol: 'EURUSD',
        volume: 0.1,
        open_price: 1.1980,
        current_price: 1.2050,
        sl: 1.1900,
        tp: 1.2100,
        profit: 70,
        swap: 0,
        commission: -2
      }
    ];

    const predictions = [
      {
        _id: 'pred123',
        symbol: 'EURUSD',
        timeframe: '5m',
        predictionTime: '2025-04-01T10:00:00',
        direction: 'BUY',
        confidence: 0.85,
        entryPrice: 1.2000,
        stopLoss: 1.1950,
        takeProfit: 1.2100,
        riskReward: 2.0,
        marketRegime: 'TRENDING',
        sentimentScore: 0.6,
        features: {
          deepLearning: true,
          sentiment: true,
          advancedRisk: true,
          adaptiveParameters: true
        }
      }
    ];

    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: {
          _id: 'user123',
          mtAccounts: [
            {
              login: '12345678',
              server: 'MetaQuotes-Demo',
              balance: 10000,
              equity: 10070,
              margin: 100,
              margin_free: 9970,
              margin_level: 10070,
              currency: 'USD'
            }
          ]
        }
      },
      market: {
        marketData,
        isLoading: false
      },
      trading: {
        openPositions,
        isLoading: false
      },
      model: {
        predictions,
        isLoading: false
      }
    });
    
    // Reset mocks
    fetchMarketData.mockClear();
    startMarketDataStream.mockClear();
    fetchOpenPositions.mockClear();
    fetchModelPredictions.mockClear();
    generatePrediction.mockClear();
  });

  test('renders trading dashboard correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TradingDashboard />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if important elements are rendered
    expect(screen.getByText('Trading Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Generate Prediction')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    
    // Check if tabs are rendered
    expect(screen.getByText('Chart')).toBeInTheDocument();
    expect(screen.getByText('Predictions')).toBeInTheDocument();
    expect(screen.getByText('Positions')).toBeInTheDocument();
    
    // Check if sidebar components are rendered
    expect(screen.getByText('Trading Controls')).toBeInTheDocument();
    expect(screen.getByText('Model Performance')).toBeInTheDocument();
    expect(screen.getByText('Account Summary')).toBeInTheDocument();
  });

  test('fetches initial data on mount', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TradingDashboard />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if data fetching actions were dispatched
    expect(fetchMarketData).toHaveBeenCalledWith({ symbol: 'EURUSD', timeframe: '5m' });
    expect(fetchOpenPositions).toHaveBeenCalled();
    expect(fetchModelPredictions).toHaveBeenCalledWith({ symbol: 'EURUSD', timeframe: '5m' });
    expect(startMarketDataStream).toHaveBeenCalledWith({ symbol: 'EURUSD' });
  });

  test('handles generate prediction button click', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TradingDashboard />
        </BrowserRouter>
      </Provider>
    );
    
    // Click the generate prediction button
    fireEvent.click(screen.getByText('Generate Prediction'));
    
    // Check if generatePrediction action was dispatched
    expect(generatePrediction).toHaveBeenCalledWith({ symbol: 'EURUSD', timeframe: '5m' });
  });

  test('displays market data correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TradingDashboard />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if market data is displayed
    expect(screen.getByText('EURUSD')).toBeInTheDocument();
    expect(screen.getByText('1.20500')).toBeInTheDocument(); // Latest close price
  });

  test('displays account information correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <TradingDashboard />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if account information is displayed
    expect(screen.getByText('Balance:')).toBeInTheDocument();
    expect(screen.getByText('10000 USD')).toBeInTheDocument();
    expect(screen.getByText('Equity:')).toBeInTheDocument();
    expect(screen.getByText('10070 USD')).toBeInTheDocument();
  });
});
