import os
import sys
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import tensorflow as tf
from sklearn.preprocessing import StandardScaler
import lightgbm as lgb
import requests
import re
from bs4 import BeautifulSoup
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Ensure NLTK resources are downloaded
try:
    nltk.data.find('vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')

# Import the advanced forex model components
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.deep_learning import LSTMModel, TransformerModel
from models.sentiment_analyzer import MarketSentimentAnalyzer
from models.advanced_risk import RiskManager
from models.adaptive_parameters import AdaptiveParameterManager

class ForexModel:
    def __init__(self, symbol, timeframe, features, risk_settings):
        self.symbol = symbol
        self.timeframe = timeframe
        self.features = features
        self.risk_settings = risk_settings
        
        # Initialize components based on features
        self.initialize_components()
        
    def initialize_components(self):
        # Initialize deep learning models if enabled
        if self.features.get('Deep Learning', {}).get('enabled', False):
            dl_params = self.features.get('Deep Learning', {}).get('parameters', {})
            model_type = dl_params.get('modelType', 'LSTM')
            
            if model_type == 'LSTM':
                self.dl_model = LSTMModel(
                    lookback=int(dl_params.get('lookbackPeriod', 60)),
                    features=['open', 'high', 'low', 'close', 'volume']
                )
            elif model_type == 'Transformer':
                self.dl_model = TransformerModel(
                    lookback=int(dl_params.get('lookbackPeriod', 60)),
                    features=['open', 'high', 'low', 'close', 'volume']
                )
            else:  # Ensemble
                self.dl_model = {
                    'lstm': LSTMModel(
                        lookback=int(dl_params.get('lookbackPeriod', 60)),
                        features=['open', 'high', 'low', 'close', 'volume']
                    ),
                    'transformer': TransformerModel(
                        lookback=int(dl_params.get('lookbackPeriod', 60)),
                        features=['open', 'high', 'low', 'close', 'volume']
                    )
                }
        else:
            self.dl_model = None
        
        # Initialize sentiment analyzer if enabled
        if self.features.get('Sentiment Analysis', {}).get('enabled', False):
            sentiment_params = self.features.get('Sentiment Analysis', {}).get('parameters', {})
            self.sentiment_analyzer = MarketSentimentAnalyzer(
                include_social=sentiment_params.get('includeSocialMedia', True),
                include_news=sentiment_params.get('includeNewsEvents', True),
                sentiment_weight=float(sentiment_params.get('sentimentWeight', 0.3))
            )
        else:
            self.sentiment_analyzer = None
        
        # Initialize risk manager if enabled
        if self.features.get('Advanced Risk Management', {}).get('enabled', False):
            risk_params = self.features.get('Advanced Risk Management', {}).get('parameters', {})
            self.risk_manager = RiskManager(
                use_kelly=risk_params.get('useKellyCriterion', True),
                dynamic_sl=risk_params.get('dynamicStopLoss', True),
                min_rr=float(risk_params.get('riskRewardMinimum', 1.5)),
                max_risk_per_trade=float(self.risk_settings.get('maxRiskPerTrade', 2.0)),
                max_open_trades=int(self.risk_settings.get('maxOpenTrades', 5))
            )
        else:
            self.risk_manager = None
        
        # Initialize adaptive parameters if enabled
        if self.features.get('Adaptive Parameters', {}).get('enabled', False):
            adaptive_params = self.features.get('Adaptive Parameters', {}).get('parameters', {})
            self.adaptive_manager = AdaptiveParameterManager(
                detect_regime=adaptive_params.get('marketRegimeDetection', True),
                adjust_volatility=adaptive_params.get('volatilityAdjustment', True),
                adaptation_speed=float(adaptive_params.get('adaptationSpeed', 0.5))
            )
        else:
            self.adaptive_manager = None
    
    def preprocess_data(self, data):
        """Preprocess market data for model input"""
        # Convert to DataFrame if it's a list of dictionaries
        if isinstance(data, list):
            df = pd.DataFrame(data)
            # Convert time strings to datetime
            df['time'] = pd.to_datetime(df['time'])
        else:
            df = data.copy()
        
        # Sort by time
        df = df.sort_values('time')
        
        # Calculate additional features
        df['returns'] = df['close'].pct_change()
        df['log_returns'] = np.log(df['close'] / df['close'].shift(1))
        
        # Add technical indicators
        df['sma_20'] = df['close'].rolling(window=20).mean()
        df['sma_50'] = df['close'].rolling(window=50).mean()
        df['rsi'] = self.calculate_rsi(df['close'])
        df['atr'] = self.calculate_atr(df)
        df['bollinger_upper'], df['bollinger_lower'] = self.calculate_bollinger_bands(df['close'])
        df['macd'], df['macd_signal'] = self.calculate_macd(df['close'])
        
        # Drop NaN values
        df = df.dropna()
        
        return df
    
    def calculate_rsi(self, prices, period=14):
        """Calculate RSI indicator"""
        delta = prices.diff()
        gain = delta.where(delta > 0, 0).rolling(window=period).mean()
        loss = -delta.where(delta < 0, 0).rolling(window=period).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def calculate_atr(self, df, period=14):
        """Calculate Average True Range"""
        high = df['high']
        low = df['low']
        close = df['close']
        
        tr1 = high - low
        tr2 = abs(high - close.shift())
        tr3 = abs(low - close.shift())
        
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        atr = tr.rolling(window=period).mean()
        return atr
    
    def calculate_bollinger_bands(self, prices, period=20, std_dev=2):
        """Calculate Bollinger Bands"""
        sma = prices.rolling(window=period).mean()
        std = prices.rolling(window=period).std()
        upper_band = sma + (std * std_dev)
        lower_band = sma - (std * std_dev)
        return upper_band, lower_band
    
    def calculate_macd(self, prices, fast_period=12, slow_period=26, signal_period=9):
        """Calculate MACD indicator"""
        fast_ema = prices.ewm(span=fast_period, adjust=False).mean()
        slow_ema = prices.ewm(span=slow_period, adjust=False).mean()
        macd = fast_ema - slow_ema
        macd_signal = macd.ewm(span=signal_period, adjust=False).mean()
        return macd, macd_signal
    
    def detect_market_regime(self, df):
        """Detect market regime (trending, ranging, volatile)"""
        # Calculate directional movement
        adx = self.calculate_adx(df)
        
        # Calculate volatility
        volatility = df['atr'] / df['close'] * 100
        
        # Determine regime
        if adx.iloc[-1] > 25:
            regime = "TRENDING"
        elif volatility.iloc[-1] > volatility.rolling(window=20).mean().iloc[-1] * 1.5:
            regime = "VOLATILE"
        else:
            regime = "RANGING"
        
        return regime
    
    def calculate_adx(self, df, period=14):
        """Calculate Average Directional Index"""
        high = df['high']
        low = df['low']
        close = df['close']
        
        # Calculate +DM and -DM
        plus_dm = high.diff()
        minus_dm = low.diff()
        
        # Adjust +DM and -DM
        plus_dm = plus_dm.where((plus_dm > 0) & (plus_dm > minus_dm.abs()), 0)
        minus_dm = minus_dm.abs().where((minus_dm < 0) & (minus_dm.abs() > plus_dm), 0)
        
        # Calculate TR
        tr1 = high - low
        tr2 = (high - close.shift()).abs()
        tr3 = (low - close.shift()).abs()
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        
        # Calculate smoothed values
        smoothed_tr = tr.rolling(window=period).sum()
        smoothed_plus_dm = plus_dm.rolling(window=period).sum()
        smoothed_minus_dm = minus_dm.rolling(window=period).sum()
        
        # Calculate +DI and -DI
        plus_di = 100 * smoothed_plus_dm / smoothed_tr
        minus_di = 100 * smoothed_minus_dm / smoothed_tr
        
        # Calculate DX and ADX
        dx = 100 * (plus_di - minus_di).abs() / (plus_di + minus_di)
        adx = dx.rolling(window=period).mean()
        
        return adx
    
    def get_sentiment_score(self):
        """Get sentiment score for the symbol"""
        if self.sentiment_analyzer:
            return self.sentiment_analyzer.get_sentiment(self.symbol)
        return 0.0
    
    def generate_prediction(self, data):
        """Generate trading prediction based on market data"""
        # Preprocess data
        df = self.preprocess_data(data)
        
        # Detect market regime if adaptive parameters are enabled
        market_regime = "UNKNOWN"
        if self.adaptive_manager:
            market_regime = self.detect_market_regime(df)
            # Adjust parameters based on regime
            self.adaptive_manager.adjust_parameters(market_regime, df)
        
        # Get sentiment score if sentiment analysis is enabled
        sentiment_score = 0.0
        if self.sentiment_analyzer:
            sentiment_score = self.get_sentiment_score()
        
        # Generate prediction from deep learning model if enabled
        dl_prediction = 0.0
        dl_confidence = 0.0
        if self.dl_model:
            if isinstance(self.dl_model, dict):  # Ensemble
                lstm_pred, lstm_conf = self.dl_model['lstm'].predict(df)
                transformer_pred, transformer_conf = self.dl_model['transformer'].predict(df)
                
                # Weighted average based on confidence
                total_conf = lstm_conf + transformer_conf
                if total_conf > 0:
                    dl_prediction = (lstm_pred * lstm_conf + transformer_pred * transformer_conf) / total_conf
                    dl_confidence = max(lstm_conf, transformer_conf)
                else:
                    dl_prediction = 0.0
                    dl_confidence = 0.0
            else:
                dl_prediction, dl_confidence = self.dl_model.predict(df)
        
        # Generate prediction from technical indicators
        tech_prediction, tech_confidence = self.technical_prediction(df)
        
        # Combine predictions
        dl_weight = 0.6 if self.dl_model else 0.0
        sentiment_weight = 0.2 if self.sentiment_analyzer else 0.0
        tech_weight = 1.0 - dl_weight - sentiment_weight
        
        # Calculate final prediction
        prediction = (
            dl_prediction * dl_weight +
            sentiment_score * sentiment_weight +
            tech_prediction * tech_weight
        )
        
        # Determine direction
        if prediction > 0.2:
            direction = "BUY"
        elif prediction < -0.2:
            direction = "SELL"
        else:
            direction = "NEUTRAL"
        
        # Calculate confidence
        confidence = abs(prediction)
        
        # Check confidence threshold
        dl_params = self.features.get('Deep Learning', {}).get('parameters', {})
        confidence_threshold = float(dl_params.get('confidenceThreshold', 0.7))
        
        if confidence < confidence_threshold:
            direction = "NEUTRAL"
        
        # Calculate entry price, stop loss, and take profit
        current_price = df['close'].iloc[-1]
        atr = df['atr'].iloc[-1]
        
        if direction == "BUY":
            entry_price = current_price
            stop_loss = entry_price - (atr * 2)
            take_profit = entry_price + (atr * 3)
        elif direction == "SELL":
            entry_price = current_price
            stop_loss = entry_price + (atr * 2)
            take_profit = entry_price - (atr * 3)
        else:
            entry_price = current_price
            stop_loss = 0
            take_profit = 0
        
        # Calculate risk-reward ratio
        risk_reward = 0
        if direction != "NEUTRAL" and abs(entry_price - stop_loss) > 0:
            risk_reward = abs(take_profit - entry_price) / abs(entry_price - stop_loss)
        
        # Apply risk management if enabled
        if self.risk_manager and direction != "NEUTRAL":
            # Adjust stop loss and take profit
            if self.risk_manager.dynamic_sl:
                volatility = df['atr'].rolling(window=20).mean().iloc[-1] / df['close'].rolling(window=20).mean().iloc[-1]
                
                if direction == "BUY":
                    stop_loss = entry_price - (atr * (1 + volatility * 5))
                    take_profit = entry_price + (atr * (1 + volatility * 5) * risk_reward)
                else:
                    stop_loss = entry_price + (atr * (1 + volatility * 5))
                    take_profit = entry_price - (atr * (1 + volatility * 5) * risk_reward)
            
            # Check minimum risk-reward ratio
            if risk_reward < self.risk_manager.min_rr:
                direction = "NEUTRAL"
                confidence = 0
        
        # Prepare result
        result = {
            "success": True,
            "symbol": self.symbol,
            "timeframe": self.timeframe,
            "direction": direction,
            "confidence": float(confidence),
            "entryPrice": float(entry_price),
            "stopLoss": float(stop_loss),
            "takeProfit": float(take_profit),
            "riskReward": float(risk_reward),
            "marketRegime": market_regime,
            "sentimentScore": float(sentiment_score),
            "parameters": {
                "dl_prediction": float(dl_prediction),
                "dl_confidence": float(dl_confidence),
                "tech_prediction": float(tech_prediction),
                "tech_confidence": float(tech_confidence),
                "atr": float(atr)
            }
        }
        
        return result
    
    def technical_prediction(self, df):
        """Generate prediction based on technical indicators"""
        # Get latest values
        close = df['close'].iloc[-1]
        sma_20 = df['sma_20'].iloc[-1]
        sma_50 = df['sma_50'].iloc[-1]
        rsi = df['rsi'].iloc[-1]
        macd = df['macd'].iloc[-1]
        macd_signal = df['macd_signal'].iloc[-1]
        bollinger_upper = df['bollinger_upper'].iloc[-1]
        bollinger_lower = df['bollinger_lower'].iloc[-1]
        
        # Initialize signals
        signals = []
        
        # Moving average signals
        if close > sma_20 and sma_20 > sma_50:
            signals.append(("MA", 1.0))  # Bullish
        elif close < sma_20 and sma_20 < sma_50:
            signals.append(("MA", -1.0))  # Bearish
        
        # RSI signals
        if rsi < 30:
            signals.append(("RSI", 1.0))  # Oversold, bullish
        elif rsi > 70:
            signals.append(("RSI", -1.0))  # Overbought, bearish
        
        # MACD signals
        if macd > macd_signal and macd > 0:
            signals.append(("MACD", 1.0))  # Bullish
        elif macd < macd_signal and macd < 0:
            signals.append(("MACD", -1.0))  # Bearish
        
        # Bollinger Bands signals
        if close < bollinger_lower:
            signals.append(("BB", 1.0))  # Price below lower band, bullish
        elif close > bollinger_upper:
            signals.append(("BB", -1.0))  # Price above upper band, bearish
        
        # Calculate weighted prediction
        if signals:
            prediction = sum(signal[1] for signal in signals) / len(signals)
            confidence = min(abs(prediction), 1.0)
            return prediction, confidence
        else:
            return 0.0, 0.0

# Function to run model prediction
def run_prediction(symbol, timeframe, features_json, risk_settings_json):
    try:
        # Parse JSON inputs
        features = json.loads(features_json)
        risk_settings = json.loads(risk_settings_json)
        
        # Create model instance
        model = ForexModel(symbol, timeframe, features, risk_settings)
        
        # Generate sample data for testing
        # In a real implementation, this would come from MT5
        data = generate_sample_data(symbol, 100)
        
        # Generate prediction
        prediction = model.generate_prediction(data)
        
        return json.dumps(prediction)
    
    except Exception as e:
        return json.dumps({
            "success": False,
            "message": f"Model prediction failed: {str(e)}"
        })

# Function to generate sample data for testing
def generate_sample_data(symbol, bars=100):
    """Generate sample OHLCV data for testing"""
    np.random.seed(42)  # For reproducibility
    
    # Start with a base price
    base_price = 1.2000 if symbol.startswith("EUR") else 1.5000
    
    # Generate random price movements
    returns = np.random.normal(0, 0.001, bars)
    prices = base_price * np.exp(np.cumsum(returns))
    
    # Generate OHLCV data
    data = []
    for i in range(bars):
        close_price = prices[i]
        high_price = close_price * (1 + abs(np.random.normal(0, 0.0005)))
        low_price = close_price * (1 - abs(np.random.normal(0, 0.0005)))
        open_price = close_price * (1 + np.random.normal(0, 0.0003))
        volume = int(np.random.normal(1000, 200))
        
        # Ensure high is highest and low is lowest
        high_price = max(high_price, open_price, close_price)
        low_price = min(low_price, open_price, close_price)
        
        # Create timestamp
        timestamp = datetime.now() - timedelta(minutes=i)
        
        data.append({
            "time": timestamp.isoformat(),
            "open": float(open_price),
            "high": float(high_price),
            "low": float(low_price),
            "close": float(close_price),
            "tick_volume": volume,
            "spread": 2,
            "real_volume": volume * 10
        })
    
    # Reverse to get chronological order
    data.reverse()
    
    return data

# Main function
if __name__ == "__main__":
    # Check arguments
    if len(sys.argv) < 5:
        print(json.dumps({
            "success": False,
            "message": "Missing arguments. Required: symbol, timeframe, features_json, risk_settings_json"
        }))
        sys.exit(1)
    
    # Get arguments
    symbol = sys.argv[1]
    timeframe = sys.argv[2]
    features_json = sys.argv[3]
    risk_settings_json = sys.argv[4]
    
    # Run prediction
    result = run_prediction(symbol, timeframe, features_json, risk_settings_json)
    print(result)
