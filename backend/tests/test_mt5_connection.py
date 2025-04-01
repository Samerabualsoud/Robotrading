import pytest
import json
import os
import sys
from unittest.mock import patch, MagicMock

# Add the scripts directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.mt5_connection import connect, get_market_data, get_positions, place_trade, close_trade, modify_trade

# Mock MT5 module
class MockMT5:
    def __init__(self):
        self.initialized = False
        self.authorized = False
        self.account_info = None
        self.positions = []
        self.rates = []
        self.last_error_message = "No error"
        
        # Constants
        self.TIMEFRAME_M1 = 1
        self.TIMEFRAME_M5 = 5
        self.TIMEFRAME_M15 = 15
        self.TIMEFRAME_M30 = 30
        self.TIMEFRAME_H1 = 60
        self.TIMEFRAME_H4 = 240
        self.TIMEFRAME_D1 = 1440
        
        self.ORDER_TYPE_BUY = 0
        self.ORDER_TYPE_SELL = 1
        
        self.TRADE_ACTION_DEAL = 1
        self.TRADE_ACTION_SLTP = 2
        
        self.ORDER_TIME_GTC = 1
        self.ORDER_FILLING_IOC = 2
        
        self.TRADE_RETCODE_DONE = 10009
    
    def initialize(self):
        self.initialized = True
        return self.initialized
    
    def login(self, login=None, password=None, server=None):
        if not self.initialized:
            return False
        
        if login == "12345678" and password == "password123" and server == "MetaQuotes-Demo":
            self.authorized = True
            
            # Create mock account info
            class AccountInfo:
                def __init__(self):
                    self.login = 12345678
                    self.name = "Test User"
                    self.server = "MetaQuotes-Demo"
                    self.currency = "USD"
                    self.balance = 10000.0
                    self.equity = 10070.0
                    self.margin = 100.0
                    self.margin_free = 9970.0
                    self.margin_level = 10070.0
                    self.leverage = 100
            
            self.account_info = AccountInfo()
            return True
        
        self.last_error_message = "Invalid login credentials"
        return False
    
    def shutdown(self):
        self.initialized = False
        self.authorized = False
        return True
    
    def account_info(self):
        if not self.authorized:
            return None
        return self.account_info
    
    def last_error(self):
        return self.last_error_message
    
    def copy_rates_from_pos(self, symbol, timeframe, start_pos, count):
        if not self.authorized:
            return None
        
        # Create mock rates data
        import numpy as np
        
        if symbol == "EURUSD":
            base_price = 1.2000
        elif symbol == "GBPUSD":
            base_price = 1.5000
        else:
            base_price = 1.0000
        
        rates = []
        for i in range(count):
            time = 1617235200 + i * 300  # 5-minute intervals starting from some date
            open_price = base_price + np.random.normal(0, 0.0010)
            high_price = open_price + abs(np.random.normal(0, 0.0005))
            low_price = open_price - abs(np.random.normal(0, 0.0005))
            close_price = open_price + np.random.normal(0, 0.0008)
            
            rates.append((time, open_price, high_price, low_price, close_price, 1000, 2, 10000))
        
        # Convert to structured array
        dtype = np.dtype([
            ('time', np.int64),
            ('open', np.float64),
            ('high', np.float64),
            ('low', np.float64),
            ('close', np.float64),
            ('tick_volume', np.int64),
            ('spread', np.int32),
            ('real_volume', np.int64)
        ])
        
        return np.array(rates, dtype=dtype)
    
    def positions_get(self, ticket=None):
        if not self.authorized:
            return None
        
        if len(self.positions) == 0:
            # Create mock positions
            class Position:
                def __init__(self, ticket, symbol, type_value, volume, price_open, price_current, sl, tp):
                    self.ticket = ticket
                    self.symbol = symbol
                    self.type = type_value  # 0 for buy, 1 for sell
                    self.volume = volume
                    self.price_open = price_open
                    self.price_current = price_current
                    self.sl = sl
                    self.tp = tp
                    self.time = 1617235200
                    self.profit = (price_current - price_open) * 10000 * volume if type_value == 0 else (price_open - price_current) * 10000 * volume
                    self.swap = 0.0
                    self.commission = -2.0
            
            self.positions = [
                Position(123456, "EURUSD", 0, 0.1, 1.1980, 1.2050, 1.1900, 1.2100),
                Position(123457, "GBPUSD", 1, 0.2, 1.5050, 1.5000, 1.5100, 1.4900)
            ]
        
        if ticket:
            return [pos for pos in self.positions if pos.ticket == ticket]
        
        return self.positions
    
    def symbol_info_tick(self, symbol):
        class Tick:
            def __init__(self, bid, ask):
                self.bid = bid
                self.ask = ask
        
        if symbol == "EURUSD":
            return Tick(1.2045, 1.2047)
        elif symbol == "GBPUSD":
            return Tick(1.4995, 1.4997)
        else:
            return Tick(1.0000, 1.0001)
    
    def order_send(self, request):
        class Result:
            def __init__(self, retcode, order, price):
                self.retcode = retcode
                self.order = order
                self.price = price
        
        # Simulate successful order
        return Result(self.TRADE_RETCODE_DONE, 123458, request.get('price', 0))


@pytest.fixture
def mock_mt5():
    with patch('MetaTrader5', MockMT5()) as mock:
        yield mock


def test_connect_success(mock_mt5):
    result = json.loads(connect("MetaQuotes-Demo", "12345678", "password123"))
    
    assert result["success"] is True
    assert result["message"] == "Connection successful"
    assert result["accountInfo"]["login"] == 12345678
    assert result["accountInfo"]["balance"] == 10000.0


def test_connect_failure(mock_mt5):
    result = json.loads(connect("MetaQuotes-Demo", "12345678", "wrong_password"))
    
    assert result["success"] is False
    assert "MT5 login failed" in result["message"]


def test_get_market_data(mock_mt5):
    result = json.loads(get_market_data("MetaQuotes-Demo", "12345678", "EURUSD", "5m", "10"))
    
    assert result["success"] is True
    assert result["symbol"] == "EURUSD"
    assert result["timeframe"] == "5m"
    assert len(result["data"]) == 10
    
    # Check data structure
    first_candle = result["data"][0]
    assert "time" in first_candle
    assert "open" in first_candle
    assert "high" in first_candle
    assert "low" in first_candle
    assert "close" in first_candle
    assert "tick_volume" in first_candle


def test_get_positions(mock_mt5):
    result = json.loads(get_positions("MetaQuotes-Demo", "12345678"))
    
    assert result["success"] is True
    assert len(result["positions"]) == 2
    
    # Check position structure
    first_position = result["positions"][0]
    assert first_position["symbol"] == "EURUSD"
    assert first_position["type"] == "BUY"
    assert first_position["volume"] == 0.1
    assert "open_price" in first_position
    assert "current_price" in first_position
    assert "profit" in first_position


def test_place_trade(mock_mt5):
    result = json.loads(place_trade("MetaQuotes-Demo", "12345678", "EURUSD", "BUY", "0.1", "0", "1.1900", "1.2100"))
    
    assert result["success"] is True
    assert result["message"] == "Trade placed successfully"
    assert result["trade"]["symbol"] == "EURUSD"
    assert result["trade"]["type"] == "BUY"
    assert result["trade"]["volume"] == 0.1


def test_close_trade(mock_mt5):
    result = json.loads(close_trade("MetaQuotes-Demo", "12345678", "123456"))
    
    assert result["success"] is True
    assert result["message"] == "Trade closed successfully"
    assert result["result"]["ticket"] == 123456
    assert result["result"]["symbol"] == "EURUSD"


def test_modify_trade(mock_mt5):
    result = json.loads(modify_trade("MetaQuotes-Demo", "12345678", "123456", "1.1850", "1.2150"))
    
    assert result["success"] is True
    assert result["message"] == "Trade modified successfully"
    assert result["result"]["ticket"] == 123456
    assert result["result"]["sl"] == 1.1850
    assert result["result"]["tp"] == 1.2150
