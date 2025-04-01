const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { PythonShell } = require('python-shell');
const path = require('path');

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Path to the Python script for MT5 authentication
const MT5_AUTH_SCRIPT = path.join(__dirname, '../../scripts/mt5_auth.py');

/**
 * Authenticate user with MT5/MT4 credentials
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.login = async (req, res) => {
  try {
    const { server, login, password, broker } = req.body;
    
    if (!server || !login || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Server, login, and password are required' 
      });
    }
    
    // Authenticate with MT5/MT4 using Python script
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.dirname(MT5_AUTH_SCRIPT),
      args: [server, login, password]
    };
    
    PythonShell.run(path.basename(MT5_AUTH_SCRIPT), options, async (err, results) => {
      if (err) {
        console.error('MT5 authentication error:', err);
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication failed. Invalid credentials or server connection issue.' 
        });
      }
      
      // Parse the result from the Python script
      const authResult = JSON.parse(results[0]);
      
      if (!authResult.success) {
        return res.status(401).json({ 
          success: false, 
          message: authResult.message || 'Authentication failed' 
        });
      }
      
      // Authentication successful, find or create user
      let user = await User.findOne({ 
        'mtAccounts.accountNumber': login.toString(),
        'mtAccounts.server': server
      });
      
      if (!user) {
        // Create new user if not exists
        user = new User({
          name: authResult.name || `User ${login}`,
          email: authResult.email || `user${login}@example.com`,
          mtAccounts: [{
            broker: broker || 'Unknown',
            accountNumber: login.toString(),
            server: server,
            accountType: authResult.accountType || 'Demo',
            lastConnected: new Date()
          }]
        });
        await user.save();
      } else {
        // Update last connected time
        const accountIndex = user.mtAccounts.findIndex(
          acc => acc.accountNumber === login.toString() && acc.server === server
        );
        
        if (accountIndex >= 0) {
          user.mtAccounts[accountIndex].lastConnected = new Date();
          if (broker) {
            user.mtAccounts[accountIndex].broker = broker;
          }
        }
        
        await user.save();
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user._id,
          mtAccount: login.toString(),
          server: server
        }, 
        JWT_SECRET, 
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      // Return user info and token
      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mtAccounts: user.mtAccounts,
          preferences: user.preferences
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get current user information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Logout user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.logout = (req, res) => {
  // In a stateless JWT authentication, the client is responsible for removing the token
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

/**
 * Verify token and return user info
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mtAccounts: user.mtAccounts,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};
