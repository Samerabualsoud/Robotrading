import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Divider,
  useTheme
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

import { RootState } from '../../store';
import { fetchMarketData } from '../../store/slices/marketSlice';

interface PriceChartProps {
  data: any[];
  symbol: string;
  timeframe: string;
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: string) => void;
  predictions?: any[];
}

const PriceChart: React.FC<PriceChartProps> = ({
  data,
  symbol,
  timeframe,
  onSymbolChange,
  onTimeframeChange,
  predictions
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.market);
  
  const [availableSymbols] = useState(['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD']);
  const [availableTimeframes] = useState(['1m', '5m', '15m', '30m', '1h', '4h', '1d']);
  
  // Format data for chart
  const chartData = data.map(item => ({
    time: new Date(item.time).toLocaleTimeString(),
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: item.tick_volume
  }));
  
  // Add prediction markers to chart data
  if (predictions && predictions.length > 0) {
    predictions.forEach(prediction => {
      const predictionTime = new Date(prediction.predictionTime).toLocaleTimeString();
      const dataPoint = chartData.find(item => item.time === predictionTime);
      
      if (dataPoint) {
        dataPoint.prediction = prediction.direction === 'BUY' ? prediction.entryPrice : 
                              prediction.direction === 'SELL' ? prediction.entryPrice : null;
        dataPoint.predictionType = prediction.direction;
      }
    });
  }
  
  // Handle symbol change
  const handleSymbolChange = (newSymbol: string) => {
    onSymbolChange(newSymbol);
  };
  
  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: string) => {
    onTimeframeChange(newTimeframe);
  };
  
  // Refresh data
  const handleRefresh = () => {
    dispatch(fetchMarketData({ symbol, timeframe }));
  };
  
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* Chart controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {availableSymbols.map(sym => (
            <Button
              key={sym}
              variant={sym === symbol ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleSymbolChange(sym)}
            >
              {sym}
            </Button>
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {availableTimeframes.map(tf => (
            <Button
              key={tf}
              variant={tf === timeframe ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleTimeframeChange(tf)}
            >
              {tf}
            </Button>
          ))}
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={20} /> : 'Refresh'}
        </Button>
      </Box>
      
      {/* Price information */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h2">
              {symbol} ({timeframe})
            </Typography>
            {data.length > 0 && (
              <Typography variant="h4" component="p" color={
                data[data.length - 1].close > data[data.length - 2]?.close
                  ? 'success.main'
                  : 'error.main'
              }>
                {data[data.length - 1].close.toFixed(5)}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {data.length > 0 && (
                <>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Open</Typography>
                    <Typography variant="body1">{data[data.length - 1].open.toFixed(5)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">High</Typography>
                    <Typography variant="body1">{data[data.length - 1].high.toFixed(5)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Low</Typography>
                    <Typography variant="body1">{data[data.length - 1].low.toFixed(5)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Volume</Typography>
                    <Typography variant="body1">{data[data.length - 1].tick_volume}</Typography>
                  </Box>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Chart */}
      <Paper sx={{ p: 2, height: 400 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="close"
                stroke={theme.palette.primary.main}
                activeDot={{ r: 8 }}
                dot={false}
              />
              {/* Prediction markers */}
              {predictions && predictions.length > 0 && (
                <>
                  <Line
                    type="monotone"
                    dataKey="prediction"
                    stroke={theme.palette.secondary.main}
                    strokeDasharray="5 5"
                    dot={(props) => {
                      const { cx, cy, dataKey, payload } = props;
                      if (!payload.prediction) return null;
                      
                      return payload.predictionType === 'BUY' ? (
                        <TrendingUp
                          sx={{
                            color: 'success.main',
                            fontSize: 20,
                            transform: 'translate(-10px, -10px)'
                          }}
                          x={cx}
                          y={cy}
                        />
                      ) : (
                        <TrendingDown
                          sx={{
                            color: 'error.main',
                            fontSize: 20,
                            transform: 'translate(-10px, -10px)'
                          }}
                          x={cx}
                          y={cy}
                        />
                      );
                    }}
                    activeDot={false}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="body1" color="text.secondary">
              No data available
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PriceChart;
