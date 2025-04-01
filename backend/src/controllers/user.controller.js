const User = require('../models/user.model');
const ModelConfig = require('../models/modelConfig.model');

/**
 * Get user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserProfile = async (req, res) => {
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
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, preferences } = req.body;
    
    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }
    
    // Save updated user
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mtAccounts: user.mtAccounts,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Add MT5/MT4 account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addMTAccount = async (req, res) => {
  try {
    const { broker, accountNumber, server, accountType } = req.body;
    
    if (!broker || !accountNumber || !server) {
      return res.status(400).json({ 
        success: false, 
        message: 'Broker, account number, and server are required' 
      });
    }
    
    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if account already exists
    const accountExists = user.mtAccounts.some(
      acc => acc.accountNumber === accountNumber && acc.server === server
    );
    
    if (accountExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Account already exists' 
      });
    }
    
    // Add new account
    user.mtAccounts.push({
      broker,
      accountNumber,
      server,
      accountType: accountType || 'Demo',
      lastConnected: new Date()
    });
    
    // Save updated user
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Account added successfully',
      account: user.mtAccounts[user.mtAccounts.length - 1]
    });
  } catch (error) {
    console.error('Add MT account error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Remove MT5/MT4 account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.removeMTAccount = async (req, res) => {
  try {
    const { accountNumber, server } = req.params;
    
    if (!accountNumber || !server) {
      return res.status(400).json({ 
        success: false, 
        message: 'Account number and server are required' 
      });
    }
    
    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Find account index
    const accountIndex = user.mtAccounts.findIndex(
      acc => acc.accountNumber === accountNumber && acc.server === server
    );
    
    if (accountIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Account not found' 
      });
    }
    
    // Remove account
    user.mtAccounts.splice(accountIndex, 1);
    
    // If removed account was the default account, update preferences
    if (user.preferences.defaultAccount === accountNumber) {
      user.preferences.defaultAccount = user.mtAccounts.length > 0 
        ? user.mtAccounts[0].accountNumber 
        : null;
    }
    
    // Save updated user
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Account removed successfully'
    });
  } catch (error) {
    console.error('Remove MT account error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get user model configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getModelConfig = async (req, res) => {
  try {
    // Find model config for user
    let modelConfig = await ModelConfig.findOne({ userId: req.user.id });
    
    // If no config exists, create default
    if (!modelConfig) {
      modelConfig = await ModelConfig.createDefaultConfig(req.user.id);
    }
    
    res.status(200).json({
      success: true,
      modelConfig
    });
  } catch (error) {
    console.error('Get model config error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Update user model configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateModelConfig = async (req, res) => {
  try {
    const { features, symbols, timeframes, riskSettings } = req.body;
    
    // Find model config for user
    let modelConfig = await ModelConfig.findOne({ userId: req.user.id });
    
    // If no config exists, create default
    if (!modelConfig) {
      modelConfig = await ModelConfig.createDefaultConfig(req.user.id);
    }
    
    // Update fields
    if (features) modelConfig.features = features;
    if (symbols) modelConfig.symbols = symbols;
    if (timeframes) modelConfig.timeframes = timeframes;
    if (riskSettings) {
      modelConfig.riskSettings = {
        ...modelConfig.riskSettings,
        ...riskSettings
      };
    }
    
    modelConfig.lastUpdated = new Date();
    
    // Save updated config
    await modelConfig.save();
    
    res.status(200).json({
      success: true,
      message: 'Model configuration updated successfully',
      modelConfig
    });
  } catch (error) {
    console.error('Update model config error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
