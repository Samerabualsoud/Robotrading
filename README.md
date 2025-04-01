# Forex AI Trading Platform - README

## Overview

The Forex AI Trading Platform is a comprehensive web application that integrates with MetaTrader 5/4 accounts and leverages advanced AI models for forex trading. The platform provides real-time market data visualization, AI-powered trading signals, automated trade execution, and comprehensive account management.

## Features

- **MT5/MT4 Integration**: Direct connection to your MetaTrader 5 or 4 account
- **Advanced AI Trading Models**: Deep learning, sentiment analysis, and adaptive parameters
- **Real-time Trading Dashboard**: Interactive charts with prediction markers
- **Automated Trading**: Execute trades based on AI predictions
- **Risk Management**: Advanced position sizing and drawdown protection
- **Performance Analytics**: Track model accuracy and trading performance

## Technology Stack

### Frontend
- React with TypeScript
- Redux for state management
- Material UI for component library
- TradingView charts for technical analysis
- Socket.IO for real-time updates

### Backend
- Node.js with Express
- MongoDB for data storage
- JWT authentication
- WebSockets for real-time communication
- Python scripts for MT5/MT4 integration and model execution

### AI Trading Model
- Deep learning models (LSTM, Transformer)
- Sentiment analysis integration
- Technical indicator processing
- Adaptive parameter optimization
- Market regime detection

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- Python 3.8+
- MetaTrader 5 or 4 installed with active account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/forex-trading-platform.git
cd forex-trading-platform
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Install Python dependencies:
```bash
cd ../backend
pip install -r requirements.txt
```

5. Configure environment variables:
   - Create `.env` file in the backend directory
   - Set required variables (see `.env.example`)

### Running Locally

1. Start MongoDB:
```bash
mongod
```

2. Start the backend:
```bash
cd backend
npm start
```

3. Start the frontend:
```bash
cd frontend
npm start
```

4. Access the application at `http://localhost:3000`

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Usage

See [USER_GUIDE.md](USER_GUIDE.md) for comprehensive usage instructions.

## Project Structure

```
forex-trading-platform/
├── frontend/                # React frontend application
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   └── utils/           # Utility functions
│   └── tests/               # Frontend tests
├── backend/                 # Node.js backend API
│   ├── src/                 # Source code
│   │   ├── controllers/     # API controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── scripts/             # Python scripts for MT5 and models
│   └── tests/               # Backend tests
└── .do/                     # Digital Ocean deployment config
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- MetaTrader 5 API for trading integration
- TradingView for charting libraries
- Various open-source libraries and frameworks used in this project
