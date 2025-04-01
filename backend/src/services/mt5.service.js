const { PythonShell } = require('python-shell');
const path = require('path');
const socketService = require('./socket.service');

// Path to the Python script for MT5 connection
const MT5_CONNECTION_SCRIPT = path.join(__dirname, '../../scripts/mt5_connection.py');

// Store active connections
const activeConnections = new Map();

/**
 * Initialize MT5 service
 */
exports.init = () => {
  console.log('Initializing MT5 service...');
};

/**
 * Connect to MT5 terminal
 * @param {string} server - MT5 server
 * @param {string} login - MT5 login
 * @param {string} password - MT5 password
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Connection result
 */
exports.connect = (server, login, password, userId) => {
  return new Promise((resolve, reject) => {
    // Check if connection already exists
    const connectionKey = `${userId}_${login}_${server}`;
    if (activeConnections.has(connectionKey)) {
      return resolve({
        success: true,
        message: 'Already connected',
        connectionId: connectionKey
      });
    }
    
    // Execute MT5 connection using Python script
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(MT5_CONNECTION_SCRIPT),
      args: [
        'CONNECT',
        server,
        login,
        password
      ]
    };
    
    PythonShell.run(path.basename(MT5_CONNECTION_SCRIPT), options, (err, results) => {
      if (err) {
        console.error('MT5 connection error:', err);
        return reject({
          success: false,
          message: 'MT5 connection failed. Execution error.'
        });
      }
      
      // Parse the result from the Python script
      const connectionResult = JSON.parse(results[0]);
      
      if (!connectionResult.success) {
        return reject({
          success: false,
          message: connectionResult.message || 'MT5 connection failed'
        });
      }
      
      // Store connection
      activeConnections.set(connectionKey, {
        userId,
        login,
        server,
        connected: true,
        lastActivity: new Date()
      });
      
      // Return success
      resolve({
        success: true,
        message: 'MT5 connection successful',
        connectionId: connectionKey,
        accountInfo: connectionResult.accountInfo
      });
    });
  });
};

/**
 * Disconnect from MT5 terminal
 * @param {string} connectionId - Connection ID
 * @returns {Promise<Object>} Disconnection result
 */
exports.disconnect = (connectionId) => {
  return new Promise((resolve, reject) => {
    // Check if connection exists
    if (!activeConnections.has(connectionId)) {
      return resolve({
        success: true,
        message: 'Not connected'
      });
    }
    
    const connection = activeConnections.get(connectionId);
    
    // Execute MT5 disconnection using Python script
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(MT5_CONNECTION_SCRIPT),
      args: [
        'DISCONNECT',
        connection.server,
        connection.login
      ]
    };
    
    PythonShell.run(path.basename(MT5_CONNECTION_SCRIPT), options, (err, results) => {
      if (err) {
        console.error('MT5 disconnection error:', err);
        return reject({
          success: false,
          message: 'MT5 disconnection failed. Execution error.'
        });
      }
      
      // Remove connection
      activeConnections.delete(connectionId);
      
      // Return success
      resolve({
        success: true,
        message: 'MT5 disconnection successful'
      });
    });
  });
};

/**
 * Get account information
 * @param {string} connectionId - Connection ID
 * @returns {Promise<Object>} Account information
 */
exports.getAccountInfo = (connectionId) => {
  return new Promise((resolve, reject) => {
    // Check if connection exists
    if (!activeConnections.has(connectionId)) {
      return reject({
        success: false,
        message: 'Not connected'
      });
    }
    
    const connection = activeConnections.get(connectionId);
    
    // Execute MT5 account info using Python script
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(MT5_CONNECTION_SCRIPT),
      args: [
        'ACCOUNT_INFO',
        connection.server,
        connection.login
      ]
    };
    
    PythonShell.run(path.basename(MT5_CONNECTION_SCRIPT), options, (err, results) => {
      if (err) {
        console.error('MT5 account info error:', err);
        return reject({
          success: false,
          message: 'MT5 account info failed. Execution error.'
        });
      }
      
      // Parse the result from the Python script
      const accountResult = JSON.parse(results[0]);
      
      if (!accountResult.success) {
        return reject({
          success: false,
          message: accountResult.message || 'MT5 account info failed'
        });
      }
      
      // Update last activity
      connection.lastActivity = new Date();
      activeConnections.set(connectionId, connection);
      
      // Return account info
      resolve({
        success: true,
        accountInfo: accountResult.accountInfo
      });
    });
  });
};

/**
 * Get market data
 * @param {string} connectionId - Connection ID
 * @param {string} symbol - Symbol
 * @param {string} timeframe - Timeframe
 * @param {number} bars - Number of bars
 * @returns {Promise<Object>} Market data
 */
exports.getMarketData = (connectionId, symbol, timeframe, bars = 100) => {
  return new Promise((resolve, reject) => {
    // Check if connection exists
    if (!activeConnections.has(connectionId)) {
      return reject({
        success: false,
        message: 'Not connected'
      });
    }
    
    const connection = activeConnections.get(connectionId);
    
    // Execute MT5 market data using Python script
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(MT5_CONNECTION_SCRIPT),
      args: [
        'MARKET_DATA',
        connection.server,
        connection.login,
        symbol,
        timeframe,
        bars.toString()
      ]
    };
    
    PythonShell.run(path.basename(MT5_CONNECTION_SCRIPT), options, (err, results) => {
      if (err) {
        console.error('MT5 market data error:', err);
        return reject({
          success: false,
          message: 'MT5 market data failed. Execution error.'
        });
      }
      
      // Parse the result from the Python script
      const dataResult = JSON.parse(results[0]);
      
      if (!dataResult.success) {
        return reject({
          success: false,
          message: dataResult.message || 'MT5 market data failed'
        });
      }
      
      // Update last activity
      connection.lastActivity = new Date();
      activeConnections.set(connectionId, connection);
      
      // Return market data
      resolve({
        success: true,
        symbol,
        timeframe,
        data: dataResult.data
      });
    });
  });
};

/**
 * Get open positions
 * @param {string} connectionId - Connection ID
 * @returns {Promise<Object>} Open positions
 */
exports.getOpenPositions = (connectionId) => {
  return new Promise((resolve, reject) => {
    // Check if connection exists
    if (!activeConnections.has(connectionId)) {
      return reject({
        success: false,
        message: 'Not connected'
      });
    }
    
    const connection = activeConnections.get(connectionId);
    
    // Execute MT5 positions using Python script
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(MT5_CONNECTION_SCRIPT),
      args: [
        'POSITIONS',
        connection.server,
        connection.login
      ]
    };
    
    PythonShell.run(path.basename(MT5_CONNECTION_SCRIPT), options, (err, results) => {
      if (err) {
        console.error('MT5 positions error:', err);
        return reject({
          success: false,
          message: 'MT5 positions failed. Execution error.'
        });
      }
      
      // Parse the result from the Python script
      const positionsResult = JSON.parse(results[0]);
      
      if (!positionsResult.success) {
        return reject({
          success: false,
          message: positionsResult.message || 'MT5 positions failed'
        });
      }
      
      // Update last activity
      connection.lastActivity = new Date();
      activeConnections.set(connectionId, connection);
      
      // Return positions
      resolve({
        success: true,
        positions: positionsResult.positions
      });
    });
  });
};

/**
 * Place a trade
 * @param {string} connectionId - Connection ID
 * @param {Object} tradeParams - Trade parameters
 * @returns {Promise<Object>} Trade result
 */
exports.placeTrade = (connectionId, tradeParams) => {
  return new Promise((resolve, reject) => {
    // Check if connection exists
    if (!activeConnections.has(connectionId)) {
      return reject({
        success: false,
        message: 'Not connected'
      });
    }
    
    const connection = activeConnections.get(connectionId);
    
    // Execute MT5 trade using Python script
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(MT5_CONNECTION_SCRIPT),
      args: [
        'TRADE',
        connection.server,
        connection.login,
        tradeParams.symbol,
        tradeParams.type,
        tradeParams.volume.toString(),
        tradeParams.price ? tradeParams.price.toString() : '0',
        tradeParams.stopLoss ? tradeParams.stopLoss.toString() : '0',
        tradeParams.takeProfit ? tradeParams.takeProfit.toString() : '0'
      ]
    };
    
    PythonShell.run(path.basename(MT5_CONNECTION_SCRIPT), options, (err, results) => {
      if (err) {
        console.error('MT5 trade error:', err);
        return reject({
          success: false,
          message: 'MT5 trade failed. Execution error.'
        });
      }
      
      // Parse the result from the Python script
      const tradeResult = JSON.parse(results[0]);
      
      if (!tradeResult.success) {
        return reject({
          success: false,
          message: tradeResult.message || 'MT5 trade failed'
        });
      }
      
      // Update last activity
      connection.lastActivity = new Date();
      activeConnections.set(connectionId, connection);
      
      // Emit trade event to connected clients
      socketService.emitToUser(connection.userId, 'trade_executed', {
        success: true,
        trade: tradeResult.trade
      });
      
      // Return trade result
      resolve({
        success: true,
        trade: tradeResult.trade
      });
    });
  });
};

/**
 * Close a trade
 * @param {string} connectionId - Connection ID
 * @param {string} ticket - Trade ticket
 * @returns {Promise<Object>} Close result
 */
exports.closeTrade = (connectionId, ticket) => {
  return new Promise((resolve, reject) => {
    // Check if connection exists
    if (!activeConnections.has(connectionId)) {
      return reject({
        success: false,
        message: 'Not connected'
      });
    }
    
    const connection = activeConnections.get(connectionId);
    
    // Execute MT5 close trade using Python script
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(MT5_CONNECTION_SCRIPT),
      args: [
        'CLOSE',
        connection.server,
        connection.login,
        ticket
      ]
    };
    
    PythonShell.run(path.basename(MT5_CONNECTION_SCRIPT), options, (err, results) => {
      if (err) {
        console.error('MT5 close trade error:', err);
        return reject({
          success: false,
          message: 'MT5 close trade failed. Execution error.'
        });
      }
      
      // Parse the result from the Python script
      const closeResult = JSON.parse(results[0]);
      
      if (!closeResult.success) {
        return reject({
          success: false,
          message: closeResult.message || 'MT5 close trade failed'
        });
      }
      
      // Update last activity
      connection.lastActivity = new Date();
      activeConnections.set(connectionId, connection);
      
      // Emit trade closed event to connected clients
      socketService.emitToUser(connection.userId, 'trade_closed', {
        success: true,
        ticket,
        result: closeResult.result
      });
      
      // Return close result
      resolve({
        success: true,
        result: closeResult.result
      });
    });
  });
};

/**
 * Modify a trade
 * @param {string} connectionId - Connection ID
 * @param {string} ticket - Trade ticket
 * @param {number} stopLoss - Stop loss
 * @param {number} takeProfit - Take profit
 * @returns {Promise<Object>} Modify result
 */
exports.modifyTrade = (connectionId, ticket, stopLoss, takeProfit) => {
  return new Promise((resolve, reject) => {
    // Check if connection exists
    if (!activeConnections.has(connectionId)) {
      return reject({
        success: false,
        message: 'Not connected'
      });
    }
    
    const connection = activeConnections.get(connectionId);
    
    // Execute MT5 modify trade using Python script
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(MT5_CONNECTION_SCRIPT),
      args: [
        'MODIFY',
        connection.server,
        connection.login,
        ticket,
        stopLoss.toString(),
        takeProfit.toString()
      ]
    };
    
    PythonShell.run(path.basename(MT5_CONNECTION_SCRIPT), options, (err, results) => {
      if (err) {
        console.error('MT5 modify trade error:', err);
        return reject({
          success: false,
          message: 'MT5 modify trade failed. Execution error.'
        });
      }
      
      // Parse the result from the Python script
      const modifyResult = JSON.parse(results[0]);
      
      if (!modifyResult.success) {
        return reject({
          success: false,
          message: modifyResult.message || 'MT5 modify trade failed'
        });
      }
      
      // Update last activity
      connection.lastActivity = new Date();
      activeConnections.set(connectionId, connection);
      
      // Emit trade modified event to connected clients
      socketService.emitToUser(connection.userId, 'trade_modified', {
        success: true,
        ticket,
        stopLoss,
        takeProfit
      });
      
      // Return modify result
      resolve({
        success: true,
        result: modifyResult.result
      });
    });
  });
};

/**
 * Start market data streaming
 * @param {string} connectionId - Connection ID
 * @param {string} symbol - Symbol
 * @returns {Promise<Object>} Stream result
 */
exports.startMarketDataStream = (connectionId, symbol) => {
  return new Promise((resolve, reject) => {
    // Check if connection exists
    if (!activeConnections.has(connectionId)) {
      return reject({
        success: false,
        message: 'Not connected'
      });
    }
    
    const connection = activeConnections.get(connectionId);
    
    // Execute MT5 stream using Python script
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(MT5_CONNECTION_SCRIPT),
      args: [
        'STREAM_START',
        connection.server,
        connection.login,
        symbol
      ]
    };
    
    PythonShell.run(path.basename(MT5_CONNECTION_SCRIPT), options, (err, results) => {
      if (err) {
        console.error('MT5 stream error:', err);
        return reject({
          success: false,
          message: 'MT5 stream failed. Execution error.'
        });
      }
      
      // Parse the result from the Python script
      const streamResult = JSON.parse(results[0]);
      
      if (!streamResult.success) {
        return reject({
          success: false,
          message: streamResult.message || 'MT5 stream failed'
        });
      }
      
      // Update last activity
      connection.lastActivity = new Date();
      activeConnections.set(connectionId, connection);
      
      // Return stream result
      resolve({
        success: true,
        message: 'Market data stream started'
      });
    });
  });
};

/**
 * Stop market data streaming
 * @param {string} connectionId - Connection ID
 * @param {string} symbol - Symbol
 * @returns {Promise<Object>} Stream result
 */
exports.stopMarketDataStream = (connectionId, symbol) => {
  return new Promise((resolve, reject) => {
    // Check if connection exists
    if (!activeConnections.has(connectionId)) {
      return reject({
        success: false,
        message: 'Not connected'
      });
    }
    
    const connection = activeConnections.get(connectionId);
    
    // Execute MT5 stream stop using Python script
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(MT5_CONNECTION_SCRIPT),
      args: [
        'STREAM_STOP',
        connection.server,
        connection.login,
        symbol
      ]
    };
    
    PythonShell.run(path.basename(MT5_CONNECTION_SCRIPT), options, (err, results) => {
      if (err) {
        console.error('MT5 stream stop error:', err);
        return reject({
          success: false,
          message: 'MT5 stream stop failed. Execution error.'
        });
      }
      
      // Parse the result from the Python script
      const streamResult = JSON.parse(results[0]);
      
      if (!streamResult.success) {
        return reject({
          success: false,
          message: streamResult.message || 'MT5 stream stop failed'
        });
      }
      
      // Update last activity
      connection.lastActivity = new Date();
      activeConnections.set(connectionId, connection);
      
      // Return stream result
      resolve({
        success: true,
        message: 'Market data stream stopped'
      });
    });
  });
};

/**
 * Shutdown MT5 service
 */
exports.shutdown = () => {
  console.log('Shutting down MT5 service...');
  
  // Disconnect all connections
  for (const connectionId of activeConnections.keys()) {
    this.disconnect(connectionId).catch(err => {
      console.error(`Error disconnecting ${connectionId}:`, err);
    });
  }
};
