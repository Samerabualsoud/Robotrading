import pytest
import json
import os
import sys
from unittest.mock import patch, MagicMock

# Add the scripts directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.run_model import ForexModel, run_prediction

class TestForexModel:
    @pytest.fixture
    def model_instance(self):
        # Create test features and risk settings
        features = {
            "Deep Learning": {
                "enabled": True,
                "parameters": {
                    "modelType": "LSTM",
                    "lookbackPeriod": 60,
                    "confidenceThreshold": 0.7
                }
            },
            "Sentiment Analysis": {
                "enabled": True,
                "parameters": {
                    "includeSocialMedia": True,
                    "includeNewsEvents": True,
                    "sentimentWeight": 0.3
                }
            },
            "Advanced Risk Management": {
                "enabled": True,
                "parameters": {
                    "useKellyCriterion": True,
                    "dynamicStopLoss": True,
                    "riskRewardMinimum": 1.5
                }
            },
            "Adaptive Parameters": {
                "enabled": True,
                "parameters": {
                    "marketRegimeDetection": True,
                    "volatilityAdjustment": True,
                    "adaptationSpeed": 0.5
                }
            }
        }
        
        risk_settings = {
            "maxRiskPerTrade": 2.0,
            "maxOpenTrades": 5,
            "maxDailyDrawdown": 5.0,
            "accountProtection": True
        }
        
        # Create sample data
        data = []
        base_price = 1.2000
        for i in range(100):
            import random
            time = f"2025-04-01T{10+i//12:02d}:{(i*5)%60:02d}:00"
            open_price = base_price + random.uniform(-0.001, 0.001)
            high_price = open_price + random.uniform(0, 0.002)
            low_price = open_price - random.uniform(0, 0.002)
            close_price = open_price + random.uniform(-0.001, 0.001)
            
            data.append({
                "time": time,
                "open": open_price,
                "high": high_price,
                "low": low_price,
                "close": close_price,
                "tick_volume": random.randint(800, 1200),
                "spread": 2,
                "real_volume": random.randint(8000, 12000)
            })
        
        # Create model instance with mocked components
        model = ForexModel("EURUSD", "5m", features, risk_settings)
        
        # Mock the deep learning model
        if hasattr(model, 'dl_model'):
            if isinstance(model.dl_model, dict):
                for key in model.dl_model:
                    model.dl_model[key].predict = MagicMock(return_value=(0.8, 0.75))
            else:
                model.dl_model.predict = MagicMock(return_value=(0.8, 0.75))
        
        # Mock the sentiment analyzer
        if hasattr(model, 'sentiment_analyzer'):
            model.sentiment_analyzer.get_sentiment = MagicMock(return_value=0.6)
        
        # Return the model with sample data
        return model, data
    
    def test_model_initialization(self, model_instance):
        model, _ = model_instance
        
        # Check if model components are initialized correctly
        assert model.symbol == "EURUSD"
        assert model.timeframe == "5m"
        
        # Check if deep learning model is initialized
        assert hasattr(model, 'dl_model')
        
        # Check if sentiment analyzer is initialized
        assert hasattr(model, 'sentiment_analyzer')
        
        # Check if risk manager is initialized
        assert hasattr(model, 'risk_manager')
        
        # Check if adaptive manager is initialized
        assert hasattr(model, 'adaptive_manager')
    
    def test_preprocess_data(self, model_instance):
        model, data = model_instance
        
        # Preprocess data
        df = model.preprocess_data(data)
        
        # Check if dataframe has expected columns
        expected_columns = [
            'time', 'open', 'high', 'low', 'close', 'tick_volume', 'spread', 'real_volume',
            'returns', 'log_returns', 'sma_20', 'sma_50', 'rsi', 'atr', 
            'bollinger_upper', 'bollinger_lower', 'macd', 'macd_signal'
        ]
        
        for col in expected_columns:
            assert col in df.columns
        
        # Check if technical indicators are calculated correctly
        assert not df['rsi'].isnull().any()
        assert not df['atr'].isnull().any()
        assert not df['bollinger_upper'].isnull().any()
        assert not df['bollinger_lower'].isnull().any()
        assert not df['macd'].isnull().any()
        assert not df['macd_signal'].isnull().any()
    
    def test_detect_market_regime(self, model_instance):
        model, data = model_instance
        
        # Preprocess data
        df = model.preprocess_data(data)
        
        # Detect market regime
        regime = model.detect_market_regime(df)
        
        # Check if regime is one of the expected values
        assert regime in ["TRENDING", "RANGING", "VOLATILE"]
    
    def test_technical_prediction(self, model_instance):
        model, data = model_instance
        
        # Preprocess data
        df = model.preprocess_data(data)
        
        # Get technical prediction
        prediction, confidence = model.technical_prediction(df)
        
        # Check if prediction and confidence are valid
        assert isinstance(prediction, float)
        assert isinstance(confidence, float)
        assert -1.0 <= prediction <= 1.0
        assert 0.0 <= confidence <= 1.0
    
    def test_generate_prediction(self, model_instance):
        model, data = model_instance
        
        # Generate prediction
        result = model.generate_prediction(data)
        
        # Check if result has expected structure
        assert result["success"] is True
        assert result["symbol"] == "EURUSD"
        assert result["timeframe"] == "5m"
        assert result["direction"] in ["BUY", "SELL", "NEUTRAL"]
        assert 0.0 <= result["confidence"] <= 1.0
        assert isinstance(result["entryPrice"], float)
        assert isinstance(result["stopLoss"], float)
        assert isinstance(result["takeProfit"], float)
        assert isinstance(result["riskReward"], float)
        assert result["marketRegime"] in ["TRENDING", "RANGING", "VOLATILE", "UNKNOWN"]
        assert isinstance(result["sentimentScore"], float)
        
        # Check parameters
        assert "dl_prediction" in result["parameters"]
        assert "dl_confidence" in result["parameters"]
        assert "tech_prediction" in result["parameters"]
        assert "tech_confidence" in result["parameters"]
        assert "atr" in result["parameters"]
    
    def test_run_prediction_function(self):
        # Create test features and risk settings
        features = {
            "Deep Learning": {
                "enabled": True,
                "parameters": {
                    "modelType": "LSTM",
                    "lookbackPeriod": 60,
                    "confidenceThreshold": 0.7
                }
            },
            "Sentiment Analysis": {
                "enabled": False
            },
            "Advanced Risk Management": {
                "enabled": True,
                "parameters": {
                    "useKellyCriterion": True,
                    "dynamicStopLoss": True,
                    "riskRewardMinimum": 1.5
                }
            },
            "Adaptive Parameters": {
                "enabled": False
            }
        }
        
        risk_settings = {
            "maxRiskPerTrade": 2.0,
            "maxOpenTrades": 5
        }
        
        # Mock ForexModel.generate_prediction
        with patch('scripts.run_model.ForexModel.generate_prediction') as mock_generate:
            mock_generate.return_value = {
                "success": True,
                "symbol": "EURUSD",
                "timeframe": "5m",
                "direction": "BUY",
                "confidence": 0.85,
                "entryPrice": 1.2000,
                "stopLoss": 1.1950,
                "takeProfit": 1.2100,
                "riskReward": 2.0,
                "marketRegime": "TRENDING",
                "sentimentScore": 0.0,
                "parameters": {
                    "dl_prediction": 0.8,
                    "dl_confidence": 0.75,
                    "tech_prediction": 0.6,
                    "tech_confidence": 0.7,
                    "atr": 0.0025
                }
            }
            
            # Run prediction
            result = run_prediction(
                "EURUSD", 
                "5m", 
                json.dumps(features), 
                json.dumps(risk_settings)
            )
            
            # Parse result
            result_dict = json.loads(result)
            
            # Check if result has expected structure
            assert result_dict["success"] is True
            assert result_dict["symbol"] == "EURUSD"
            assert result_dict["direction"] == "BUY"
            assert result_dict["confidence"] == 0.85
