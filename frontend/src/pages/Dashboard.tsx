import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  Psychology as PsychologyIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectPositions, selectModelPredictions } from '../../store/slices/tradingSlice';
import { selectMarketData, selectCurrentSymbol } from '../../store/slices/marketSlice';
import { selectPerformance } from '../../store/slices/modelSlice';
import MarketOverview from '../market/MarketOverview';
import PerformanceChart from '../charts/PerformanceChart';
import PredictionsList from '../trading/PredictionsList';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const positions = useSelector(selectPositions);
  const marketData = useSelector(selectMarketData);
  const currentSymbol = useSelector(selectCurrentSymbol);
  const modelPredictions = useSelector(selectModelPredictions);
  const performance = useSelector(selectPerformance);
  
  // Calculate total profit/loss
  const totalPnL = positions.reduce((sum, position) => sum + position.profit, 0);
  const pnlColor = totalPnL >= 0 ? theme.palette.success.main : theme.palette.error.main;
  
  return (
    <Box sx={{ flexGrow: 1, py: 2 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Account Summary */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total P&L
            </Typography>
            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                color: pnlColor,
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
              {totalPnL >= 0 ? 
                <TrendingUpIcon sx={{ ml: 1, color: theme.palette.success.main }} /> : 
                <TrendingDownIcon sx={{ ml: 1, color: theme.palette.error.main }} />
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {positions.length} open positions
            </Typography>
          </Paper>
        </Grid>
        
        {/* Win Rate */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Win Rate
            </Typography>
            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {(performance.winRate * 100).toFixed(1)}%
              <TimelineIcon sx={{ ml: 1, color: theme.palette.primary.main }} />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {performance.totalTrades} total trades
            </Typography>
          </Paper>
        </Grid>
        
        {/* Model Confidence */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Model Confidence
            </Typography>
            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {modelPredictions.length > 0 ? 
                (modelPredictions[0].confidence * 100).toFixed(1) : 
                '0.0'
              }%
              <PsychologyIcon sx={{ ml: 1, color: theme.palette.primary.main }} />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {modelPredictions.length > 0 ? 
                `${modelPredictions[0].direction} signal for ${modelPredictions[0].symbol}` : 
                'No recent predictions'
              }
            </Typography>
          </Paper>
        </Grid>
        
        {/* Market Status */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Market Status
            </Typography>
            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {marketData[currentSymbol]?.spread.toFixed(1) || '0.0'}
              <NotificationsIcon sx={{ ml: 1, color: theme.palette.primary.main }} />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current spread for {currentSymbol}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Market Overview */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              height: 400,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Market Overview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <MarketOverview />
            </Box>
          </Paper>
        </Grid>
        
        {/* Model Predictions */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              height: 400,
              overflow: 'hidden',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Recent Predictions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <PredictionsList predictions={modelPredictions.slice(0, 10)} />
            </Box>
          </Paper>
        </Grid>
        
        {/* Performance Chart */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              height: 400,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Performance History
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <PerformanceChart />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
