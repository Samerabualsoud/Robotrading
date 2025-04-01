import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectModelPredictions } from '../../store/slices/tradingSlice';
import { selectMarketData } from '../../store/slices/marketSlice';

interface ModelPredictionCardProps {
  symbol: string;
}

const ModelPredictionCard: React.FC<ModelPredictionCardProps> = ({ symbol }) => {
  const theme = useTheme();
  const predictions = useSelector(selectModelPredictions);
  const marketData = useSelector(selectMarketData);
  
  // Find the latest prediction for the current symbol
  const currentPrediction = predictions.find(p => p.symbol === symbol);
  
  if (!currentPrediction) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          mb: 3,
        }}
      >
        <Typography variant="h6" gutterBottom>
          AI Model Prediction
        </Typography>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No prediction available for {symbol}
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  const isPositive = currentPrediction.direction === 'BUY';
  const isNeutral = currentPrediction.direction === 'NEUTRAL';
  const confidencePercent = (currentPrediction.confidence * 100).toFixed(1);
  
  const currentPrice = marketData[symbol]?.bid || currentPrediction.entryPrice;
  const priceDifference = isPositive 
    ? currentPrice - currentPrediction.entryPrice
    : currentPrediction.entryPrice - currentPrice;
  
  const pipsDifference = (priceDifference * 10000).toFixed(1);
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        mb: 3,
        borderLeft: isNeutral 
          ? `4px solid ${theme.palette.grey[500]}`
          : isPositive 
            ? `4px solid ${theme.palette.success.main}`
            : `4px solid ${theme.palette.error.main}`,
      }}
    >
      <Typography variant="h6" gutterBottom>
        AI Model Prediction
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Signal:
          </Typography>
          <Typography 
            variant="body1" 
            fontWeight="bold"
            color={isNeutral 
              ? 'text.primary'
              : isPositive 
                ? theme.palette.success.main
                : theme.palette.error.main
            }
          >
            {currentPrediction.direction}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Confidence:
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {confidencePercent}%
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Entry Price:
          </Typography>
          <Typography variant="body1">
            {currentPrediction.entryPrice.toFixed(5)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Stop Loss:
          </Typography>
          <Typography variant="body1">
            {currentPrediction.stopLoss.toFixed(5)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Take Profit:
          </Typography>
          <Typography variant="body1">
            {currentPrediction.takeProfit.toFixed(5)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Current Price:
          </Typography>
          <Typography 
            variant="body1" 
            fontWeight="bold"
            color={priceDifference >= 0 && !isNeutral
              ? theme.palette.success.main
              : priceDifference < 0 && !isNeutral
                ? theme.palette.error.main
                : 'text.primary'
            }
          >
            {currentPrice.toFixed(5)} ({pipsDifference} pips)
          </Typography>
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Generated: {new Date(currentPrediction.timestamp).toLocaleString()}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ModelPredictionCard;
