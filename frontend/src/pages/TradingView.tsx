import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentSymbol, selectTimeframe, setCurrentSymbol, setTimeframe } from '../../store/slices/marketSlice';
import { selectPositions } from '../../store/slices/tradingSlice';
import { openDialog } from '../../store/slices/uiSlice';
import PriceChart from '../charts/PriceChart';
import PositionsList from '../trading/PositionsList';
import TradingControls from '../trading/TradingControls';
import ModelPredictionCard from '../trading/ModelPredictionCard';

const TradingView: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const currentSymbol = useSelector(selectCurrentSymbol);
  const timeframe = useSelector(selectTimeframe);
  const positions = useSelector(selectPositions);
  
  const timeframes = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' },
  ];
  
  const symbols = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD'
  ];
  
  const handleSymbolChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    dispatch(setCurrentSymbol(event.target.value as string));
  };
  
  const handleTimeframeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    dispatch(setTimeframe(event.target.value as string));
  };
  
  const handleNewTrade = () => {
    dispatch(openDialog({ dialog: 'newTrade', data: { symbol: currentSymbol } }));
  };
  
  const currentPositions = positions.filter(position => position.symbol === currentSymbol);
  
  return (
    <Box sx={{ flexGrow: 1, py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Trading View
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewTrade}
          >
            New Trade
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Chart Controls */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="symbol-select-label">Symbol</InputLabel>
              <Select
                labelId="symbol-select-label"
                id="symbol-select"
                value={currentSymbol}
                label="Symbol"
                onChange={handleSymbolChange}
                size="small"
              >
                {symbols.map((symbol) => (
                  <MenuItem key={symbol} value={symbol}>{symbol}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="timeframe-select-label">Timeframe</InputLabel>
              <Select
                labelId="timeframe-select-label"
                id="timeframe-select"
                value={timeframe}
                label="Timeframe"
                onChange={handleTimeframeChange}
                size="small"
              >
                {timeframes.map((tf) => (
                  <MenuItem key={tf.value} value={tf.value}>{tf.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Tooltip title="Refresh data">
              <IconButton>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Paper>
        </Grid>
        
        {/* Price Chart */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              height: 500,
            }}
          >
            <Typography variant="h6" gutterBottom>
              {currentSymbol} - {timeframes.find(tf => tf.value === timeframe)?.label}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <PriceChart />
            </Box>
          </Paper>
        </Grid>
        
        {/* Trading Controls and Positions */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            {/* Model Prediction */}
            <Grid item xs={12}>
              <ModelPredictionCard symbol={currentSymbol} />
            </Grid>
            
            {/* Trading Controls */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">
                    Trading Controls
                  </Typography>
                  <Tooltip title="Trading controls for manual order placement">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <TradingControls symbol={currentSymbol} />
              </Paper>
            </Grid>
            
            {/* Open Positions */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Open Positions ({currentPositions.length})
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <PositionsList positions={currentPositions} />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TradingView;
