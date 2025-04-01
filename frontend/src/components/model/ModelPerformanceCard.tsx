import React from 'react';
import { Box, Typography, Paper, Grid, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectPerformance } from '../../store/slices/modelSlice';

const ModelPerformanceCard: React.FC = () => {
  const theme = useTheme();
  const performance = useSelector(selectPerformance);
  
  const metrics = [
    { label: 'Win Rate', value: `${(performance.winRate * 100).toFixed(1)}%` },
    { label: 'Profit Factor', value: performance.profitFactor.toFixed(2) },
    { label: 'Sharpe Ratio', value: performance.sharpeRatio.toFixed(2) },
    { label: 'Max Drawdown', value: `${performance.maxDrawdown.toFixed(2)}%` },
    { label: 'Total Trades', value: performance.totalTrades },
    { label: 'Profitable Trades', value: performance.profitableTrades },
    { label: 'Average Profit', value: `$${performance.averageProfit.toFixed(2)}` },
    { label: 'Average Loss', value: `$${performance.averageLoss.toFixed(2)}` },
  ];
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        mb: 3,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Model Performance
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {metrics.map((metric) => (
          <Grid item xs={6} sm={3} key={metric.label}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" fontWeight="bold" color="primary">
                {metric.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metric.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default ModelPerformanceCard;
