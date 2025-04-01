import os
import sys
import json
import MetaTrader5 as mt5
from datetime import datetime, timedelta

# Function to authenticate with MT5
def authenticate(server, login, password):
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
        "leverage": account_info.leverage,
        "accountType": "Demo" if "demo" in server.lower() else "Live"
    }
    
    # Shutdown MT5
    mt5.shutdown()
    
    return json.dumps({
        "success": True,
        "message": "Authentication successful",
        "accountInfo": account_info_dict
    })

# Main function
if __name__ == "__main__":
    # Check arguments
    if len(sys.argv) < 4:
        print(json.dumps({
            "success": False,
            "message": "Missing arguments. Required: server, login, password"
        }))
        sys.exit(1)
    
    # Get arguments
    server = sys.argv[1]
    login = sys.argv[2]
    password = sys.argv[3]
    
    # Authenticate
    result = authenticate(server, login, password)
    print(result)
