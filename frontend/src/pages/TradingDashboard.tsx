import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  CircularProgress,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { 
  Timeline, 
  TrendingUp, 
  Settings, 
  Notifications,
  AccountBalance
} from '@mui/icons-material';

import PriceChart from '../components/charts/PriceChart';
import PredictionsList from '../components/trading/PredictionsList';
import PositionsList from '../components/trading/PositionsList';
import TradingControls from '../components/trading/TradingControls';
import ModelPerformanceCard from '../components/model/ModelPerformanceCard';

import { RootState } from '../store';
import { fetchMarketData, startMarketDataStream } from '../store/slices/marketSlice';
import { fetchOpenPositions } from '../store/slices/tradingSlice';
import { fetchModelPredictions, generatePrediction } from '../store/slices/modelSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trading-tabpanel-${index}`}
      aria-labelledby={`trading-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TradingView: React.FC = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('5m');
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { marketData, isLoading: marketLoading } = useSelector((state: RootState) => state.market);
  const { openPositions, isLoading: tradingLoading } = useSelector((state: RootState) => state.trading);
  const { predictions, isLoading: modelLoading } = useSelector((state: RootState) => state.model);
  
  // Fetch initial data
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchMarketData({ symbol: selectedSymbol, timeframe: selectedTimeframe }));
      dispatch(fetchOpenPositions());
      dispatch(fetchModelPredictions({ symbol: selectedSymbol, timeframe: selectedTimeframe }));
      
      // Start market data stream
      dispatch(startMarketDataStream({ symbol: selectedSymbol }));
    }
  }, [dispatch, isAuthenticated, user, selectedSymbol, selectedTimeframe]);
  
  // Handle symbol change
  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    dispatch(fetchMarketData({ symbol, timeframe: selectedTimeframe }));
    dispatch(fetchModelPredictions({ symbol, timeframe: selectedTimeframe }));
    dispatch(startMarketDataStream({ symbol }));
  };
  
  // Handle timeframe change
  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    dispatch(fetchMarketData({ symbol: selectedSymbol, timeframe }));
    dispatch(fetchModelPredictions({ symbol: selectedSymbol, timeframe }));
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle generate prediction
  const handleGeneratePrediction = () => {
    dispatch(generatePrediction({ symbol: selectedSymbol, timeframe: selectedTimeframe }));
  };
  
  // Loading state
  const isLoading = marketLoading || tradingLoading || modelLoading;
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              Trading Dashboard
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<TrendingUp />}
                onClick={handleGeneratePrediction}
                disabled={isLoading}
              >
                Generate Prediction
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Settings />}
              >
                Settings
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Main content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="trading tabs">
                <Tab icon={<Timeline />} label="Chart" />
                <Tab icon={<TrendingUp />} label="Predictions" />
                <Tab icon={<AccountBalance />} label="Positions" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <PriceChart 
                data={marketData} 
                symbol={selectedSymbol}
                timeframe={selectedTimeframe}
                onSymbolChange={handleSymbolChange}
                onTimeframeChange={handleTimeframeChange}
                predictions={predictions}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <PredictionsList 
                predictions={predictions} 
                isLoading={modelLoading}
                onSymbolChange={handleSymbolChange}
                onTimeframeChange={handleTimeframeChange}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <PositionsList 
                positions={openPositions} 
                isLoading={tradingLoading}
              />
            </TabPanel>
          </Paper>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            {/* Trading Controls */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Trading Controls
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TradingControls 
                  symbol={selectedSymbol}
                  currentPrice={marketData.length > 0 ? marketData[marketData.length - 1].close : 0}
                  predictions={predictions}
                />
              </Paper>
            </Grid>
            
            {/* Model Performance */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Model Performance
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <ModelPerformanceCard 
                  symbol={selectedSymbol}
                  timeframe={selectedTimeframe}
                />
              </Paper>
            </Grid>
            
            {/* Account Summary */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Account Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Balance:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {user?.mtAccounts?.[0]?.balance || 0} {user?.mtAccounts?.[0]?.currency || 'USD'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Equity:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {user?.mtAccounts?.[0]?.equity || 0} {user?.mtAccounts?.[0]?.currency || 'USD'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Margin:</Typography>
                  <Typography variant="body1">
                    {user?.mtAccounts?.[0]?.margin || 0} {user?.mtAccounts?.[0]?.currency || 'USD'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Free Margin:</Typography>
                  <Typography variant="body1">
                    {user?.mtAccounts?.[0]?.margin_free || 0} {user?.mtAccounts?.[0]?.currency || 'USD'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Margin Level:</Typography>
                  <Typography variant="body1">
                    {user?.mtAccounts?.[0]?.margin_level || 0}%
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TradingView;
