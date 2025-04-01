const socketIo = require('socket.io');

// Store socket connections by user ID
const userSockets = new Map();

// Socket.io instance
let io = null;

/**
 * Initialize socket service
 * @param {Object} socketIoInstance - Socket.io instance
 */
exports.init = (socketIoInstance) => {
  io = socketIoInstance;
  
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Handle authentication
    socket.on('authenticate', (data) => {
      if (data && data.userId) {
        // Store socket connection for user
        if (!userSockets.has(data.userId)) {
          userSockets.set(data.userId, new Set());
        }
        userSockets.get(data.userId).add(socket.id);
        
        // Join user room
        socket.join(`user_${data.userId}`);
        
        console.log(`User ${data.userId} authenticated with socket ${socket.id}`);
        
        // Send confirmation
        socket.emit('authenticated', { success: true });
      } else {
        socket.emit('authenticated', { 
          success: false,
          message: 'Authentication failed. User ID required.'
        });
      }
    });
    
    // Handle subscription to market data
    socket.on('subscribe_market_data', (data) => {
      if (data && data.symbol) {
        socket.join(`market_${data.symbol}`);
        console.log(`Socket ${socket.id} subscribed to market data for ${data.symbol}`);
        socket.emit('subscribed', { 
          success: true,
          symbol: data.symbol
        });
      } else {
        socket.emit('subscribed', { 
          success: false,
          message: 'Subscription failed. Symbol required.'
        });
      }
    });
    
    // Handle unsubscription from market data
    socket.on('unsubscribe_market_data', (data) => {
      if (data && data.symbol) {
        socket.leave(`market_${data.symbol}`);
        console.log(`Socket ${socket.id} unsubscribed from market data for ${data.symbol}`);
        socket.emit('unsubscribed', { 
          success: true,
          symbol: data.symbol
        });
      }
    });
    
    // Handle subscription to model predictions
    socket.on('subscribe_predictions', (data) => {
      if (data && data.symbol) {
        socket.join(`predictions_${data.symbol}`);
        console.log(`Socket ${socket.id} subscribed to predictions for ${data.symbol}`);
        socket.emit('subscribed_predictions', { 
          success: true,
          symbol: data.symbol
        });
      } else {
        socket.emit('subscribed_predictions', { 
          success: false,
          message: 'Subscription failed. Symbol required.'
        });
      }
    });
    
    // Handle unsubscription from model predictions
    socket.on('unsubscribe_predictions', (data) => {
      if (data && data.symbol) {
        socket.leave(`predictions_${data.symbol}`);
        console.log(`Socket ${socket.id} unsubscribed from predictions for ${data.symbol}`);
        socket.emit('unsubscribed_predictions', { 
          success: true,
          symbol: data.symbol
        });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Remove socket from user connections
      for (const [userId, sockets] of userSockets.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          console.log(`Removed socket ${socket.id} for user ${userId}`);
          
          // Clean up if no more sockets for user
          if (sockets.size === 0) {
            userSockets.delete(userId);
            console.log(`No more sockets for user ${userId}`);
          }
          
          break;
        }
      }
    });
  });
  
  console.log('Socket service initialized');
};

/**
 * Emit event to specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
exports.emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

/**
 * Emit market data update
 * @param {string} symbol - Symbol
 * @param {Object} data - Market data
 */
exports.emitMarketData = (symbol, data) => {
  if (io && symbol) {
    io.to(`market_${symbol}`).emit('market_data', {
      symbol,
      data
    });
  }
};

/**
 * Emit model prediction
 * @param {string} symbol - Symbol
 * @param {Object} prediction - Prediction data
 */
exports.emitPrediction = (symbol, prediction) => {
  if (io && symbol) {
    io.to(`predictions_${symbol}`).emit('prediction', {
      symbol,
      prediction
    });
  }
};

/**
 * Emit trade notification
 * @param {string} userId - User ID
 * @param {Object} trade - Trade data
 */
exports.emitTradeNotification = (userId, trade) => {
  if (io && userId) {
    io.to(`user_${userId}`).emit('trade_notification', trade);
  }
};

/**
 * Broadcast system message to all connected clients
 * @param {string} message - Message text
 */
exports.broadcastSystemMessage = (message) => {
  if (io) {
    io.emit('system_message', { message });
  }
};

/**
 * Get number of connected clients
 * @returns {number} Number of connected clients
 */
exports.getConnectedClientsCount = () => {
  return io ? io.engine.clientsCount : 0;
};

/**
 * Get number of connected users
 * @returns {number} Number of connected users
 */
exports.getConnectedUsersCount = () => {
  return userSockets.size;
};
