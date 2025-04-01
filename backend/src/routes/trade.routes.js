const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/trade.controller');

// GET /api/trade/positions - Get open positions
router.get('/positions', tradeController.getOpenPositions);

// GET /api/trade/history - Get trade history
router.get('/history', tradeController.getTradeHistory);

// POST /api/trade - Place a new trade
router.post('/', tradeController.placeTrade);

// PUT /api/trade/:tradeId/close - Close an open trade
router.put('/:tradeId/close', tradeController.closeTrade);

// PUT /api/trade/:tradeId/modify - Modify an existing trade
router.put('/:tradeId/modify', tradeController.modifyTrade);

// GET /api/trade/stats - Get trade performance statistics
router.get('/stats', tradeController.getTradeStats);

module.exports = router;
