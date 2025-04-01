# Forex AI Trading Platform User Guide

Welcome to the Forex AI Trading Platform! This comprehensive guide will help you get started with our advanced forex trading system that integrates with your MT5/MT4 account and uses AI-powered models to enhance your trading decisions.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Trading Features](#trading-features)
4. [Model Configuration](#model-configuration)
5. [Account Management](#account-management)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

## Getting Started

### Account Setup

1. **Access the Platform**: Navigate to the platform URL provided by your administrator.
2. **Login**: On the login page, enter your MT5/MT4 credentials:
   - Select your account type (Demo or Live)
   - Choose your MT5/MT4 server from the dropdown
   - Enter your MT5/MT4 login ID
   - Enter your MT5/MT4 password
3. **First-time Setup**: Upon first login, the system will:
   - Verify your MT5/MT4 credentials
   - Connect to your trading account
   - Initialize the AI trading model
   - Set up default trading parameters

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection
- Active MT5/MT4 account with trading permissions

## Dashboard Overview

The trading dashboard is divided into several key sections:

### Main Chart Area

- **Price Chart**: Displays real-time price data with customizable timeframes
- **Prediction Markers**: Shows model predictions directly on the chart
- **Technical Indicators**: Displays selected technical indicators (RSI, MACD, Bollinger Bands, etc.)
- **Trade Markers**: Shows your open positions and pending orders

### Trading Controls

- **Symbol Selector**: Choose the currency pair to trade
- **Timeframe Selector**: Select the chart timeframe (1m, 5m, 15m, 30m, 1h, 4h, 1d)
- **Trade Entry**: Place market or pending orders
- **Position Sizing**: Set lot size manually or use risk-based calculation
- **Stop Loss/Take Profit**: Set risk management parameters

### Model Predictions

- **Current Predictions**: View the latest model predictions for selected pairs
- **Prediction History**: Review past predictions and their outcomes
- **Confidence Levels**: See the model's confidence in each prediction
- **Market Regime**: View the detected market condition (trending, ranging, volatile)

### Open Positions

- **Position List**: View all your open positions
- **Position Details**: See entry price, current price, profit/loss
- **Position Management**: Modify or close positions directly

### Account Summary

- **Balance/Equity**: View your account balance and equity
- **Margin Level**: Monitor your margin usage
- **P/L Summary**: See daily, weekly, and monthly performance

## Trading Features

### Manual Trading

1. **Place a Trade**:
   - Select your desired currency pair
   - Choose Buy or Sell
   - Set your position size
   - Set Stop Loss and Take Profit levels
   - Click "Execute Trade"

2. **Modify a Trade**:
   - Click on an open position in the Positions List
   - Adjust Stop Loss or Take Profit
   - Click "Modify"

3. **Close a Trade**:
   - Click on an open position in the Positions List
   - Click "Close Position" or set partial close percentage

### AI-Assisted Trading

1. **Generate Prediction**:
   - Select currency pair and timeframe
   - Click "Generate Prediction"
   - Review the prediction details (direction, confidence, entry/exit levels)

2. **Execute AI Prediction**:
   - When a prediction appears, click "Execute" to place the trade
   - The system will automatically set position size, stop loss, and take profit based on model recommendations

3. **Auto-Trading Mode**:
   - Enable Auto-Trading in the settings
   - Set risk parameters (max risk per trade, max open trades)
   - The system will automatically execute trades based on high-confidence predictions

## Model Configuration

### Feature Selection

Customize which advanced features are active in the model:

1. **Deep Learning**:
   - Enable/disable neural network predictions
   - Adjust confidence threshold
   - Select model type (LSTM, Transformer)

2. **Sentiment Analysis**:
   - Enable/disable news sentiment integration
   - Configure social media sentiment sources
   - Adjust sentiment weight in decision making

3. **Advanced Risk Management**:
   - Enable/disable Kelly Criterion position sizing
   - Set dynamic stop-loss adjustment
   - Configure drawdown protection

4. **Adaptive Parameters**:
   - Enable/disable market regime detection
   - Set volatility-based parameter adjustment
   - Configure adaptation speed

### Performance Monitoring

Monitor and analyze the model's performance:

- **Prediction Accuracy**: View success rate by pair, timeframe, and market condition
- **Risk-Adjusted Returns**: Analyze Sharpe ratio, Sortino ratio, and other metrics
- **Drawdown Analysis**: Monitor maximum drawdown and recovery periods
- **Feature Importance**: See which indicators and features contribute most to successful predictions

## Account Management

### Profile Settings

- **Account Details**: View your MT5/MT4 account information
- **Server Connection**: Check connection status and reconnect if needed
- **Security Settings**: Change password or enable additional security features

### Risk Management

- **Risk per Trade**: Set maximum risk percentage per trade
- **Daily Risk Limit**: Set maximum daily drawdown limit
- **Correlation Protection**: Enable protection against correlated positions
- **Trading Hours**: Set active trading hours for the system

### Notifications

- **Alert Settings**: Configure email or browser notifications
- **Threshold Alerts**: Set alerts for account balance, margin level, or specific price levels
- **Trade Notifications**: Get notified when trades are opened or closed

## Troubleshooting

### Connection Issues

If you experience connection problems:

1. **MT5/MT4 Connection**:
   - Verify your MT5/MT4 terminal is running
   - Check your internet connection
   - Ensure your login credentials are correct
   - Try reconnecting through the platform

2. **Data Feed Issues**:
   - Check if price data is updating
   - Try changing timeframes or symbols
   - Refresh the browser page

### Trading Problems

If you encounter issues with trading:

1. **Order Execution Failures**:
   - Check your account has sufficient margin
   - Verify trading is enabled for your account
   - Check for any broker restrictions
   - Review error messages in the notification area

2. **Model Prediction Issues**:
   - Ensure all required data is available
   - Check if the selected features are compatible
   - Try regenerating the prediction
   - Verify the model configuration

## FAQ

**Q: Is my MT5/MT4 password secure?**
A: Yes, your password is only used to establish the connection and is never stored on our servers.

**Q: Can I use multiple MT5/MT4 accounts?**
A: Yes, you can switch between different accounts from the account settings page.

**Q: How often are predictions generated?**
A: By default, predictions are generated every 5 minutes for selected pairs, but this can be customized in the settings.

**Q: What happens if I lose connection?**
A: The platform will attempt to reconnect automatically. Open positions are managed directly by your MT5/MT4 terminal and will remain active even if the web platform disconnects.

**Q: Can I customize the trading model?**
A: Yes, you can enable/disable specific features and adjust parameters in the Model Configuration section.

**Q: How is my trading data used?**
A: Your trading data is used only to improve the prediction models and is kept strictly confidential.

**Q: Can I export my trading history?**
A: Yes, you can export your trading history and performance metrics from the Account section.

---

For additional support, please contact our support team through the Help section in the platform.
