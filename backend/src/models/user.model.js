const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: false // Not required since we use MT5/MT4 auth
  },
  mtAccounts: [{
    broker: {
      type: String,
      required: true
    },
    accountNumber: {
      type: String,
      required: true
    },
    server: {
      type: String,
      required: true
    },
    accountType: {
      type: String,
      enum: ['Demo', 'Live'],
      default: 'Demo'
    },
    lastConnected: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    defaultAccount: {
      type: String,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to compare password
UserSchema.methods.comparePassword = async function(password) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(password, this.passwordHash);
};

// Method to hash password before saving
UserSchema.pre('save', async function(next) {
  if (this.isModified('passwordHash') && this.passwordHash) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
