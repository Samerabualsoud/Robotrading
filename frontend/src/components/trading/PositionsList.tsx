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
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { 
  Close, 
  Edit, 
  TrendingUp, 
  TrendingDown,
  Timeline
} from '@mui/icons-material';

import { RootState } from '../../store';

interface PositionsListProps {
  positions: any[];
  isLoading: boolean;
}

const PositionsList: React.FC<PositionsListProps> = ({
  positions,
  isLoading
}) => {
  // Calculate profit/loss percentage
  const calculatePLPercent = (position: any) => {
    if (!position.open_price || position.open_price === 0) return 0;
    
    const diff = position.current_price - position.open_price;
    const direction = position.type === 'BUY' ? 1 : -1;
    
    return (diff / position.open_price) * 100 * direction;
  };
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Open Positions</Typography>
        <Chip 
          label={`${positions.length} positions`} 
          color="primary" 
          variant="outlined" 
        />
      </Box>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : positions.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No open positions
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Volume</TableCell>
                <TableCell>Open Price</TableCell>
                <TableCell>Current Price</TableCell>
                <TableCell>SL</TableCell>
                <TableCell>TP</TableCell>
                <TableCell>Profit/Loss</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.ticket}>
                  <TableCell>{position.symbol}</TableCell>
                  <TableCell>
                    <Chip
                      icon={position.type === 'BUY' ? <TrendingUp /> : <TrendingDown />}
                      label={position.type}
                      color={position.type === 'BUY' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{position.volume}</TableCell>
                  <TableCell>{position.open_price.toFixed(5)}</TableCell>
                  <TableCell>{position.current_price.toFixed(5)}</TableCell>
                  <TableCell>{position.sl ? position.sl.toFixed(5) : '-'}</TableCell>
                  <TableCell>{position.tp ? position.tp.toFixed(5) : '-'}</TableCell>
                  <TableCell>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: position.profit >= 0 ? 'success.main' : 'error.main'
                    }}>
                      {position.profit.toFixed(2)}
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        ({calculatePLPercent(position).toFixed(2)}%)
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="Close Position">
                        <IconButton size="small" color="error">
                          <Close fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modify Position">
                        <IconButton size="small" color="primary">
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Chart">
                        <IconButton size="small">
                          <Timeline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PositionsList;
