import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Slider,
  Switch,
  FormControlLabel,
  Divider,
  Alert
} from '@mui/material';
import { Send, TrendingUp, TrendingDown } from '@mui/icons-material';

import { placeTrade } from '../../store/slices/tradingSlice';

interface TradingControlsProps {
  symbol: string;
  currentPrice: number;
  predictions: any[];
}

const TradingControls: React.FC<TradingControlsProps> = ({
  symbol,
  currentPrice,
  predictions
}) => {
  const dispatch = useDispatch();
  
  // Trading form state
  const [tradeType, setTradeType] = useState('BUY');
  const [volume, setVolume] = useState(0.01);
  const [stopLoss, setStopLoss] = useState(0);
  const [takeProfit, setTakeProfit] = useState(0);
  const [useModelPrediction, setUseModelPrediction] = useState(true);
  const [riskPercent, setRiskPercent] = useState(2);
  
  // Get latest prediction
  const latestPrediction = predictions && predictions.length > 0
    ? predictions[0]
    : null;
  
  // Apply prediction to form
  const applyPrediction = () => {
    if (latestPrediction) {
      setTradeType(latestPrediction.direction);
      setStopLoss(latestPrediction.stopLoss);
      setTakeProfit(latestPrediction.takeProfit);
    }
  };
  
  // Calculate position size based on risk
  const calculatePositionSize = () => {
    if (!stopLoss || stopLoss === 0) return 0.01;
    
    // Get account balance (would come from user state in real app)
    const accountBalance = 10000; // Example balance
    
    // Calculate risk amount
    const riskAmount = accountBalance * (riskPercent / 100);
    
    // Calculate pip value
    const pipValue = 0.0001; // For most pairs
    
    // Calculate pips at risk
    const pipsAtRisk = Math.abs(currentPrice - stopLoss) / pipValue;
    
    // Calculate position size
    const positionSize = riskAmount / pipsAtRisk / 10;
    
    // Round to 2 decimal places
    return Math.round(positionSize * 100) / 100;
  };
  
  // Update position size when risk percent changes
  const handleRiskChange = (event: Event, newValue: number | number[]) => {
    setRiskPercent(newValue as number);
    setVolume(calculatePositionSize());
  };
  
  // Handle trade submission
  const handleSubmitTrade = () => {
    dispatch(placeTrade({
      symbol,
      tradeType,
      volume,
      price: currentPrice,
      stopLoss,
      takeProfit
    }));
  };
  
  return (
    <Box>
      {/* Prediction alert */}
      {latestPrediction && (
        <Alert 
          severity={latestPrediction.direction === 'BUY' ? 'success' : latestPrediction.direction === 'SELL' ? 'error' : 'info'}
          icon={latestPrediction.direction === 'BUY' ? <TrendingUp /> : latestPrediction.direction === 'SELL' ? <TrendingDown /> : null}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2">
            Latest prediction: <strong>{latestPrediction.direction}</strong> with {(latestPrediction.confidence * 100).toFixed(1)}% confidence
          </Typography>
          <Button 
            size="small" 
            onClick={applyPrediction}
            sx={{ mt: 1 }}
          >
            Apply Prediction
          </Button>
        </Alert>
      )}
      
      {/* Trading form */}
      <form>
        <Grid container spacing={2}>
          {/* Symbol and price */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">{symbol}</Typography>
              <Typography variant="h6" color={tradeType === 'BUY' ? 'success.main' : 'error.main'}>
                {currentPrice.toFixed(5)}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          {/* Trade type */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Trade Type</InputLabel>
              <Select
                value={tradeType}
                label="Trade Type"
                onChange={(e) => setTradeType(e.target.value)}
              >
                <MenuItem value="BUY">Buy (Long)</MenuItem>
                <MenuItem value="SELL">Sell (Short)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Volume */}
          <Grid item xs={12}>
            <TextField
              label="Volume (Lots)"
              type="number"
              fullWidth
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              inputProps={{ step: 0.01, min: 0.01 }}
            />
          </Grid>
          
          {/* Risk percent slider */}
          <Grid item xs={12}>
            <Typography variant="body2" gutterBottom>
              Risk per Trade: {riskPercent}%
            </Typography>
            <Slider
              value={riskPercent}
              onChange={handleRiskChange}
              aria-labelledby="risk-slider"
              step={0.1}
              min={0.1}
              max={5}
              valueLabelDisplay="auto"
            />
          </Grid>
          
          {/* Stop Loss */}
          <Grid item xs={12}>
            <TextField
              label="Stop Loss"
              type="number"
              fullWidth
              value={stopLoss}
              onChange={(e) => setStopLoss(parseFloat(e.target.value))}
              inputProps={{ step: 0.00001 }}
            />
          </Grid>
          
          {/* Take Profit */}
          <Grid item xs={12}>
            <TextField
              label="Take Profit"
              type="number"
              fullWidth
              value={takeProfit}
              onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
              inputProps={{ step: 0.00001 }}
            />
          </Grid>
          
          {/* Use model prediction */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={useModelPrediction}
                  onChange={(e) => setUseModelPrediction(e.target.checked)}
                />
              }
              label="Use Model Prediction"
            />
          </Grid>
          
          {/* Submit button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color={tradeType === 'BUY' ? 'success' : 'error'}
              fullWidth
              startIcon={tradeType === 'BUY' ? <TrendingUp /> : <TrendingDown />}
              onClick={handleSubmitTrade}
              size="large"
            >
              {tradeType === 'BUY' ? 'Buy' : 'Sell'} {symbol}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default TradingControls;
