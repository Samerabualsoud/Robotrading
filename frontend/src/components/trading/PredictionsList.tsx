import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Tooltip,
  Button,
  Divider
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  Cancel,
  HourglassEmpty
} from '@mui/icons-material';

import { RootState } from '../../store';

interface PredictionsListProps {
  predictions: any[];
  isLoading: boolean;
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: string) => void;
}

const PredictionsList: React.FC<PredictionsListProps> = ({
  predictions,
  isLoading,
  onSymbolChange,
  onTimeframeChange
}) => {
  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success.main';
    if (confidence >= 0.6) return 'info.main';
    if (confidence >= 0.4) return 'warning.main';
    return 'text.secondary';
  };
  
  // Get confidence label
  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    if (confidence >= 0.4) return 'Low';
    return 'Very Low';
  };
  
  // Handle symbol click
  const handleSymbolClick = (symbol: string) => {
    onSymbolChange(symbol);
  };
  
  // Handle timeframe click
  const handleTimeframeClick = (timeframe: string) => {
    onTimeframeChange(timeframe);
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Model Predictions</Typography>
        <Chip 
          label={`${predictions.length} predictions`} 
          color="primary" 
          variant="outlined" 
        />
      </Box>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : predictions.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No predictions available
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Symbol</TableCell>
                <TableCell>Timeframe</TableCell>
                <TableCell>Direction</TableCell>
                <TableCell>Confidence</TableCell>
                <TableCell>Entry Price</TableCell>
                <TableCell>Stop Loss</TableCell>
                <TableCell>Take Profit</TableCell>
                <TableCell>R:R</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {predictions.map((prediction) => (
                <TableRow key={prediction._id}>
                  <TableCell>{formatTime(prediction.predictionTime)}</TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      onClick={() => handleSymbolClick(prediction.symbol)}
                    >
                      {prediction.symbol}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      onClick={() => handleTimeframeClick(prediction.timeframe)}
                    >
                      {prediction.timeframe}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {prediction.direction === 'BUY' ? (
                      <Chip
                        icon={<TrendingUp />}
                        label="BUY"
                        color="success"
                        size="small"
                      />
                    ) : prediction.direction === 'SELL' ? (
                      <Chip
                        icon={<TrendingDown />}
                        label="SELL"
                        color="error"
                        size="small"
                      />
                    ) : (
                      <Chip
                        label="NEUTRAL"
                        color="default"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={`${(prediction.confidence * 100).toFixed(1)}%`}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: getConfidenceColor(prediction.confidence)
                      }}>
                        {getConfidenceLabel(prediction.confidence)}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{prediction.entryPrice.toFixed(5)}</TableCell>
                  <TableCell>{prediction.stopLoss ? prediction.stopLoss.toFixed(5) : '-'}</TableCell>
                  <TableCell>{prediction.takeProfit ? prediction.takeProfit.toFixed(5) : '-'}</TableCell>
                  <TableCell>{prediction.riskReward ? prediction.riskReward.toFixed(2) : '-'}</TableCell>
                  <TableCell>
                    {prediction.status === 'EXECUTED' ? (
                      <Tooltip title="Prediction executed">
                        <CheckCircle fontSize="small" color="success" />
                      </Tooltip>
                    ) : prediction.status === 'EXPIRED' ? (
                      <Tooltip title="Prediction expired">
                        <Cancel fontSize="small" color="error" />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Prediction pending">
                        <HourglassEmpty fontSize="small" color="info" />
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Model Features
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {predictions.length > 0 && predictions[0].features && (
            <>
              <Chip 
                label="Deep Learning" 
                color={predictions[0].features.deepLearning ? "primary" : "default"}
                variant={predictions[0].features.deepLearning ? "filled" : "outlined"}
                size="small"
              />
              <Chip 
                label="Sentiment Analysis" 
                color={predictions[0].features.sentiment ? "primary" : "default"}
                variant={predictions[0].features.sentiment ? "filled" : "outlined"}
                size="small"
              />
              <Chip 
                label="Advanced Risk" 
                color={predictions[0].features.advancedRisk ? "primary" : "default"}
                variant={predictions[0].features.advancedRisk ? "filled" : "outlined"}
                size="small"
              />
              <Chip 
                label="Adaptive Parameters" 
                color={predictions[0].features.adaptiveParameters ? "primary" : "default"}
                variant={predictions[0].features.adaptiveParameters ? "filled" : "outlined"}
                size="small"
              />
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PredictionsList;
