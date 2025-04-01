import os
import sys
import json
import MetaTrader5 as mt5
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

# Function to connect to MT5
def connect(server, login, password):
    # Initialize MT5
    if not mt5.initialize():
        return json.dumps({
            "success": False,
            "message": f"MT5 initialization failed: {mt5.last_error()}"
        })
    
    # Connect to MT5 account
    authorized = mt5.login(login=int(login), password=password, server=server)
    if not authorized:
        mt5.shutdown()
        return json.dumps({
            "success": False,
            "message": f"MT5 login failed: {mt5.last_error()}"
        })
    
    # Get account info
    account_info = mt5.account_info()
    if account_info is None:
        mt5.shutdown()
        return json.dumps({
            "success": False,
            "message": "Failed to get account info"
        })
    
    # Convert account info to dict
    account_info_dict = {
        "login": account_info.login,
        "name": account_info.name,
        "server": account_info.server,
        "currency": account_info.currency,
        "balance": account_info.balance,
        "equity": account_info.equity,
        "margin": account_info.margin,
        "margin_free": account_info.margin_free,
        "margin_level": account_info.margin_level,
        "leverage": account_info.leverage
    }
    
    return json.dumps({
        "success": True,
        "message": "Connection successful",
        "accountInfo": account_info_dict
    })

# Function to get market data
def get_market_data(server, login, symbol, timeframe, bars=100):
    # Initialize MT5
    if not mt5.initialize():
        return json.dumps({
            "success": False,
            "message": f"MT5 initialization failed: {mt5.last_error()}"
        })
    
    # Connect to MT5 account
    authorized = mt5.login(login=int(login), server=server)
    if not authorized:
        mt5.shutdown()
        return json.dumps({
            "success": False,
            "message": f"MT5 login failed: {mt5.last_error()}"
        })
    
    # Map timeframe string to MT5 timeframe
    timeframe_map = {
        "1m": mt5.TIMEFRAME_M1,
        "5m": mt5.TIMEFRAME_M5,
        "15m": mt5.TIMEFRAME_M15,
        "30m": mt5.TIMEFRAME_M30,
        "1h": mt5.TIMEFRAME_H1,
        "4h": mt5.TIMEFRAME_H4,
        "1d": mt5.TIMEFRAME_D1
    }
    
    if timeframe not in timeframe_map:
        mt5.shutdown()
        return json.dumps({
            "success": False,
            "message": f"Invalid timeframe: {timeframe}"
        })
    
    # Get rates
    rates = mt5.copy_rates_from_pos(symbol, timeframe_map[timeframe], 0, int(bars))
    
    if rates is None or len(rates) == 0:
        mt5.shutdown()
        return json.dumps({
            "success": False,
            "message": f"Failed to get rates for {symbol}"
        })
    
    # Convert to pandas dataframe
    rates_df = pd.DataFrame(rates)
    rates_df['time'] = pd.to_datetime(rates_df['time'], unit='s')
    
    # Convert to dict for JSON serialization
    data = []
    for _, row in rates_df.iterrows():
        data.append({
            "time": row['time'].isoformat(),
            "open": row['open'],
            "high": row['high'],
            "low": row['low'],
            "close": row['close'],
            "tick_volume": row['tick_volume'],
            "spread": row['spread'],
            "real_volume": row['real_volume']
        })
    
    # Shutdown MT5
    mt5.shutdown()
    
    return json.dumps({
        "success": True,
        "symbol": symbol,
        "timeframe": timeframe,
        "data": data
    })

# Function to get open positions
def get_positions(server, login):
    # Initialize MT5
    if not mt5.initialize():
        return json.dumps({
            "success": False,
            "message": f"MT5 initialization failed: {mt5.last_error()}"
        })
    
    # Connect to MT5 account
    authorized = mt5.login(login=int(login), server=server)
    if not authorized:
        mt5.shutdown()
        return json.dumps({
            "success": False,
            "message": f"MT5 login failed: {mt5.last_error()}"
        })
    
    # Get positions
    positions = mt5.positions_get()
    
    if positions is None:
        mt5.shutdown()
        return json.dumps({
            "success": False,
            "message": "Failed to get positions"
        })
    
    # Convert positions to dict
    positions_list = []
    for position in positions:
        positions_list.append({
            "ticket": position.ticket,
            "time": datetime.fromtimestamp(position.time).isoformat(),
            "type": "BUY" if position.type == mt5.ORDER_TYPE_BUY else "SELL",
            "symbol": position.symbol,
            "volume": position.volume,
            "open_price": position.price_open,
            "current_price": position.price_current,
            "sl": position.sl,
            "tp": position.tp,
            "profit": position.profit,
            "swap": position.swap,
            "commission": position.commission
        })
    
    # Shutdown MT5
    mt5.shutdown()
    
    return json.dumps({
        "success": True,
        "positions": positions_list
    })

# Function to place a trade
def place_trade(server, login, symbol, trade_type, volume, price=0, sl=0, tp=0):
    # Initialize MT5
    if not mt5.initialize():
        return json.dumps({
            "success": False,
            "message": f"MT5 initialization failed: {mt5.last_error()}"
        })
    
    # Connect to MT5 account
    authorized = mt5.login(login=int(login), server=server)
    if not authorized:
        mt5.shutdown()
        return json.dumps({
            "success": False,
            "message": f"MT5 login failed: {mt5.last_error()}"
        })
    
    # Prepare trade request
    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": float(volume),
        "type": mt5.ORDER_TYPE_BUY if trade_type == "BUY" else mt5.ORDER_TYPE_SELL,
        "price": float(price) if float(price) > 0 else mt5.symbol_info_tick(symbol).ask if trade_type == "BUY" else mt5.symbol_info_tick(symbol).bid,
        "sl": float(sl) if float(sl) > 0 else 0,
        "tp": float(tp) if float(tp) > 0 else 0,
        "deviation": 10,
        "magic": 123456,
        "comment": "Python script trade",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC
    }
    
    # Send trade request
    result = mt5.order_send(request)
    
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        mt5.shutdown()
        return json.dumps({
            "success": False,
            "message": f"Trade failed with error code: {result.retcode}"
        })
    
    # Get trade details
    trade = {
        "ticket": result.order,
        "symbol": symbol,
        "type": trade_type,
        "volume": float(volume),
        "open_price": result.price,
        "sl": float(sl) if float(sl) > 0 else 0,
        "tp": float(tp) if float(tp) > 0 else 0
    }
    
    # Shutdown MT5
    mt5.shutdown()
    
    return json.dumps({
        "success": True,
        "message": "Trade placed successfully",
        "trade": trade
    })

# Function to close a trade
def close_trade(server, login, ticket):
    # Initialize MT5
    if not mt5.initialize():
        return json.dumps({
            "success": False,
            "message": f"MT5 initialization failed: {mt5.last_error()}"
        })
    
    # Connect to MT5 account
    authorized = mt5.login(login=int(login), server=server)
    if not authorized:
        mt5.shutdown()
        return json.dumps({
            "success": False,
            "message": f"MT5 login failed: {mt5.last_error()}"
        })
    
    # Get position
    position = mt5.positions_get(ticket=int(ticket))
    
    if position is None or len(position) == 0:
        mt5.shutdown()
        return json.dumps({
            "success": False,
            "message": f"Position with ticket {ticket} not found"
        })
    
    position = position[0]
    
    # Prepare close request
    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": position.symbol,
        "volume": position.volume,
        "type": mt5.ORDER_TYPE_SELL if position.type == mt5.ORDER_TYPE_BUY else mt5.ORDER_TYPE_BUY,
        "position": position.ticket,
        "price": mt5.symbol_info_tick(position.symbol).bid if position.type == mt5.ORDER_TYPE_BUY else mt5.symbol_info_tick(position.symbol).ask,
        "deviation": 10,
        "magic": 123456,
        "comment": "Python script close",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC
    }
    
    # Send close request
    result = mt5.order_send(request)
    
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        mt5.shutdown()
        return json.dumps({
            "success": False,
            "message": f"Close failed with error code: {result.retcode}"
        })
    
    # Get close details
    close_result = {
        "ticket": position.ticket,
        "symbol": position.symbol,
        "volume": position.volume,
        "close_price": result.price,
        "profit": position.profit,
        "commission": position.commission,
        "swap": position.swap
    }
    
    # Shutdown MT5
    mt5.shutdown()
    
    return json.dumps({
        "success": True,
        "message": "Trade closed successfully",
        "result": close_result
    })

# Function to modify a trade
def modify_trade(server, login, ticket, sl, tp):
    # Initialize MT5
    if not mt5.initialize():
        return json.dumps({
            "success": False,
            "message": f"MT5 initialization failed: {mt5.last_error()}"
        })
    
    # Connect to MT5 account
    authorized = mt5.login(login=int(login), server=server)
    if not authorized:
        mt5.shutdown()
        return json.dumps({
            "success": False,
            "message": f"MT5 login failed: {mt5.last_error()}"
        })
    
    # Get position
    position = mt5.positions_get(ticket=int(ticket))
    
    if position is None or len(position) == 0:
        mt5.shutdown()
        return json.dumps({
            "success": False,
            "message": f"Position with ticket {ticket} not found"
        })
    
    position = position[0]
    
    # Prepare modify request
    request = {
        "action": mt5.TRADE_ACTION_SLTP,
        "symbol": position.symbol,
        "position": position.ticket,
        "sl": float(sl),
        "tp": float(tp)
    }
    
    # Send modify request
    result = mt5.order_send(request)
    
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        mt5.shutdown()
        return json.dumps({
            "success": False,
            "message": f"Modify failed with error code: {result.retcode}"
        })
    
    # Shutdown MT5
    mt5.shutdown()
    
    return json.dumps({
        "success": True,
        "message": "Trade modified successfully",
        "result": {
            "ticket": position.ticket,
            "sl": float(sl),
            "tp": float(tp)
        }
    })

# Main function
if __name__ == "__main__":
    # Check arguments
    if len(sys.argv) < 3:
        print(json.dumps({
            "success": False,
            "message": "Missing arguments. Required: command, server, login, [additional args]"
        }))
        sys.exit(1)
    
    # Get command and arguments
    command = sys.argv[1]
    server = sys.argv[2]
    login = sys.argv[3]
    
    # Execute command
    if command == "CONNECT":
        if len(sys.argv) < 5:
            print(json.dumps({
                "success": False,
                "message": "Missing password for CONNECT command"
            }))
            sys.exit(1)
        password = sys.argv[4]
        print(connect(server, login, password))
    
    elif command == "MARKET_DATA":
        if len(sys.argv) < 6:
            print(json.dumps({
                "success": False,
                "message": "Missing symbol or timeframe for MARKET_DATA command"
            }))
            sys.exit(1)
        symbol = sys.argv[4]
        timeframe = sys.argv[5]
        bars = sys.argv[6] if len(sys.argv) > 6 else "100"
        print(get_market_data(server, login, symbol, timeframe, bars))
    
    elif command == "POSITIONS":
        print(get_positions(server, login))
    
    elif command == "TRADE":
        if len(sys.argv) < 7:
            print(json.dumps({
                "success": False,
                "message": "Missing parameters for TRADE command"
            }))
            sys.exit(1)
        symbol = sys.argv[4]
        trade_type = sys.argv[5]
        volume = sys.argv[6]
        price = sys.argv[7] if len(sys.argv) > 7 else "0"
        sl = sys.argv[8] if len(sys.argv) > 8 else "0"
        tp = sys.argv[9] if len(sys.argv) > 9 else "0"
        print(place_trade(server, login, symbol, trade_type, volume, price, sl, tp))
    
    elif command == "CLOSE":
        if len(sys.argv) < 5:
            print(json.dumps({
                "success": False,
                "message": "Missing ticket for CLOSE command"
            }))
            sys.exit(1)
        ticket = sys.argv[4]
        print(close_trade(server, login, ticket))
    
    elif command == "MODIFY":
        if len(sys.argv) < 7:
            print(json.dumps({
                "success": False,
                "message": "Missing parameters for MODIFY command"
            }))
            sys.exit(1)
        ticket = sys.argv[4]
        sl = sys.argv[5]
        tp = sys.argv[6]
        print(modify_trade(server, login, ticket, sl, tp))
    
    else:
        print(json.dumps({
            "success": False,
            "message": f"Unknown command: {command}"
        }))
