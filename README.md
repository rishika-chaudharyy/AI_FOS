# AI-FOS: AI Financial Operating System

An intelligent financial data processing and analysis platform that leverages AI/ML to classify transactions, generate financial insights, and provide a comprehensive view of financial health.

## 🎯 Overview

AI-FOS is a full-stack application that automates financial data analysis using a three-tier classification system:
1. **Rule-based classification** - Fast keyword matching
2. **ML-based classification** - Machine learning with scikit-learn
3. **LLM-based classification** - Advanced AI classification using Groq API

Process your financial data (CSV/XLSX) to automatically categorize transactions and generate financial statements, balance sheets, and cash flow analysis.

---

## ✨ Features

### Core Functionality
- **Intelligent Transaction Classification** - Categorizes transactions as Income, Expense, Asset, or Liability
- **Multi-format File Support** - Import financial data from CSV and Excel files
- **Automatic Data Normalization** - Detects and normalizes column headers
- **Data Preprocessing Pipeline** - Cleans text, handles missing values, removes noise
- **Financial Report Generation** - Creates P&L statements and balance sheets
- **AI Cash Flow Advisory** - Fast-tracks liquidity analysis (burn rate, runway) with Groq-powered AI CFO insights
- **Comparative Insights** - Compare multiple datasets (e.g. Year-over-Year) to track growth, variance, and expense drops
- **Double-Entry Journal Generation** - Generates proper accounting journal entries
- **Ledger Management** - Creates and maintains account ledgers
- **Dashboard Analytics** - Visual representation of financial data with charts
- **Real-time Processing** - FastAPI backend with instant data processing
- **Caching System** - SQLite-based caching for improved performance
- **Data Export** - Export classified data and reports to CSV format

### Classification Methods
- **Rule-based**: Keyword pattern matching for quick classification
- **ML-based**: Trained LogisticRegression model using TF-IDF vectorization
- **LLM-based**: Groq API integration with Llama 3.3 70B model for context-aware classification

---

## 🏗️ Project Structure

```
AI-FOS/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   │   └── upload.py      # File upload and processing
│   │   ├── services/          # Business logic
│   │   │   ├── classifier.py  # Transaction classification
│   │   │   ├── finance_engine.py # Financial calculations
│   │   │   ├── journal_engine.py # Journal entry processing
│   │   │   ├── ledger_engine.py # Ledger management
│   │   │   ├── parser.py      # Data parsing and normalization
│   │   │   └── preprocessing.py # Data cleaning and preprocessing
│   │   ├── core/              # Core utilities
│   │   │   └── db.py          # Database operations
│   │   ├── data/              # Sample datasets
│   │   │   ├── enterprise_dataset.csv
│   │   │   └── generate_dataset.py
│   │   ├── models/            # Data models
│   │   └── utils/             # Helper functions
│   ├── main.py                # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   ├── transactions.db        # SQLite database
│   └── venv/                  # Virtual environment
├── frontend/                   # React Vite application
│   ├── src/
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.jsx  # Main dashboard
│   │   │   ├── Upload.jsx     # File upload page
│   │   │   ├── Analysis.jsx   # Analysis view
│   │   │   ├── Statements.jsx # Financial statements
│   │   │   ├── Cashflow.jsx   # Cash flow analysis
│   │   │   ├── Journal.jsx    # Journal entries
│   │   │   └── Landing.jsx    # Landing page
│   │   ├── components/        # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   └── Upload.jsx
│   │   ├── store/             # State management
│   │   │   └── useStore.js
│   │   ├── assets/            # Images and icons
│   │   ├── styles/            # CSS files
│   │   └── App.jsx            # Main app component
│   ├── package.json           # NPM dependencies
│   ├── vite.config.js         # Vite configuration
│   ├── index.html             # HTML entry point
│   └── README.md              # Frontend documentation
├── financial_dataset_10k.csv  # Sample financial data (10k records)
├── financial_dataset_5k.csv   # Sample financial data (5k records)
├── ledger.csv                 # Ledger sample data
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- Groq API key (for LLM classification)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your GROQ_API_KEY
   ```

5. **Start the server**
   ```bash
   uvicorn main:app --reload
   ```
   Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

---

## 📚 API Endpoints

### Main Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | `GET` | Health check |
| `/process` | `POST` | Upload and classify financial data file |
| `/analyze` | `POST` | Generate financial statements (P&L, Balance Sheet) |
| `/journal-ledger` | `POST` | Generate journal entries and account ledgers |
| `/cashflow-insights` | `POST` | Generate LLM-powered cash flow strategy, forecasting, and anomaly detection |

### Request/Response Examples

**Upload & Classify File**
```bash
curl -X POST "http://localhost:8000/process" \
  -F "file=@financial_data.csv"
```

**Response:**
```json
{
  "total_rows": 100,
  "classified_data": [
    {
      "description": "salary credit",
      "amount": 5000,
      "category": "Income"
    }
  ]
}
```

**Generate Financial Analysis**
```bash
curl -X POST "http://localhost:8000/analyze" \
  -F "file=@financial_data.csv"
```

**Response:**
```json
{
  "pnl": {
    "total_income": 50000,
    "total_expense": 30000,
    "net_profit": 20000
  },
  "balance_sheet": {
    "total_assets": 100000,
    "total_liabilities": 50000,
    "net_worth": 50000
  },
  "summary": {
    "Income": 50000,
    "Expense": 30000
  },
}
```

**Generate AI Cashflow Insights**
```bash
curl -X POST "http://localhost:8000/cashflow-insights" \
  -H "Content-Type: application/json" \
  -d '{"data": [...]}'
```

**Response:**
```json
{
  "advices": ["Cut marketing spend by 10%..."],
  "forecast": "Based on the $25k inflow trend, expect strong runway.",
  "anomalies": ["Unusually high software subscription cost."]
}
```

**Generate Journal & Ledger**
```bash
curl -X POST "http://localhost:8000/journal-ledger" \
  -F "file=@financial_data.csv"
```

**Response:**
```json
{
  "journal": [
    {
      "date": "2024-01-01",
      "debit": "Cash A/c",
      "credit": "Sales A/c",
      "amount": 5000,
      "narration": "Being salary credit"
    }
  ],
  "ledger": {
    "Cash A/c": [
      {
        "date": "2024-01-01",
        "particular": "To Sales A/c",
        "debit": 5000,
        "credit": 0
      }
    ]
  },
  "total_entries": 10
}
```

---

## 🤖 Classification System

### How It Works

1. **Rule-based Check** → If matched, return category
2. **ML Check** → If rule didn't match, use trained model
3. **LLM Check** → If ML result is uncertain, use Groq API

### Transaction Categories

- **Income** - Salary, payments, consulting fees, bonuses, sales revenue
- **Expense** - Rent, bills, subscriptions, purchases, salary payments
- **Asset** - Equipment, vehicles, property, furniture, machinery
- **Liability** - Loans, EMIs, borrowed funds
- **Purchase** - Goods purchased, inventory purchase, stock purchase

### Training Data

The ML model is trained on predefined transaction examples covering common financial scenarios.

---

## � Data Preprocessing Pipeline

The system includes a comprehensive data preprocessing pipeline that:

1. **Text Cleaning** - Converts text to lowercase, replaces abbreviations (cr→credit, dr→debit, sal→salary)
2. **Missing Value Handling** - Fills missing descriptions with "unknown", converts amounts to numeric
3. **Column Filtering** - Keeps only relevant columns (description, amount, date)
4. **Noise Removal** - Removes rows with descriptions shorter than 3 characters

---

## �💾 Supported File Formats

- **CSV** - Comma-separated values
- **XLSX** - Microsoft Excel workbooks

The system automatically:
- Detects amount and description columns
- Normalizes column headers
- Handles missing values
- Converts data types

---

## 📊 Financial Reports

### Profit & Loss Statement
- Total Income
- Total Expenses
- Net Profit

### Balance Sheet
- Total Assets
- Total Liabilities
- Net Worth

### Cash Flow Analysis & AI Advisory
- Income & Expense breakdown
- Asset/Liability movements
- **Monthly Burn Rate & Cash Runway calculations**
- **Groq LLM-powered CFO strategic insights**
- **1-Click PDF Report Export**

### Comparative Insights
- Dual-file CSV processor
- Year-over-Year (YoY) percentage growth metrics
- Comparative clustered charting
- Categorical variance tables

### Journal Entries
- Double-entry bookkeeping
- Debit and credit entries
- Narration for each transaction

### Account Ledgers
- Individual account ledgers
- Debit and credit balances
- Transaction history per account

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Web framework
- **Pandas** - Data processing
- **Groq** - LLM API
- **Scikit-learn** - ML algorithms
- **SQLite** - Database for caching
- **Python-dotenv** - Environment management
- **OpenPyXL** - Excel file processing

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Zustand** - State management

---

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Get your API key from [Groq Console](https://console.groq.com)

---

## 📦 Dependencies

### Backend
```
fastapi
pandas
uvicorn
openpyxl
python-dotenv
groq
scikit-learn
rapidfuzz
```

### Frontend
```
react@^19.2.4
react-dom@^19.2.4
react-router-dom@^7.13.1
recharts@^3.8.0
axios@^1.13.6
zustand@^5.0.12
jspdf@^4.2.1
jspdf-autotable@^5.0.7
xlsx@^0.18.5
```

---

## 🚦 Development Setup

### Running Both Services

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Building for Production

**Backend:**
```bash
# Backend runs as is, ensure all dependencies are installed
pip install -r requirements.txt
```

**Frontend:**
```bash
npm run build
# Output will be in frontend/dist/
```

---

## 🧪 Testing

### Sample Data
Test files are included in the project root and backend data directory:
- `financial_dataset_10k.csv` - Large sample dataset (10,000 records)
- `financial_dataset_5k.csv` - Medium sample dataset (5,000 records)
- `ledger.csv` - Ledger transactions sample
- `backend/app/data/enterprise_dataset.csv` - Enterprise-level financial data

Upload these through the UI or API to test the classification system.

---

## 📝 Usage Examples

### 1. Upload Financial Data
1. Navigate to the Upload page in the frontend
2. Select a CSV or XLSX file
3. Click "Process" to classify transactions
4. View results in the Dashboard

### 2. View Financial Statements
1. Go to Dashboard after processing data
2. View P&L statements in the Statements page
3. Analyze cash flow in the Cashflow page
4. Review detailed transactions in the Analysis page

### 3. API Usage
```python
import requests
import pandas as pd

# Upload file via API
with open('financial_data.csv', 'rb') as f:
    files = {'file': f}
    
    # Classify transactions
    response = requests.post('http://localhost:8000/process', files=files)
    data = response.json()
    print(f"Processed {data['total_rows']} transactions")
    
    # Generate financial analysis
    response = requests.post('http://localhost:8000/analyze', files=files)
    analysis = response.json()
    print(f"Net Profit: ${analysis['pnl']['net_profit']}")
    
    # Generate journal and ledger
    response = requests.post('http://localhost:8000/journal-ledger', files=files)
    journal_data = response.json()
    print(f"Generated {journal_data['total_entries']} journal entries")
```

---

## 🎨 Frontend Pages

- **Landing** - Welcome and introduction
- **Dashboard** - Overview of financial data
- **Upload** - File upload interface
- **Analysis** - **Comparative Insights** tool for extreme YoY variance mapping and growth charting
- **Statements** - Financial statements view
- **Cashflow** - Cash flow analysis featuring **Groq AI Advisory** insights and PDF export
- **Journal** - Transaction journal entries

---

## 🐛 Troubleshooting

### Backend Issues

**Module not found error:**
```bash
pip install -r requirements.txt
```

**CORS errors:**
- Already configured in FastAPI app
- Check that frontend URL is accessible

**API key not found:**
- Verify `.env` file exists in backend directory
- Ensure `GROQ_API_KEY` is set

### Frontend Issues

**Port already in use:**
```bash
npm run dev -- --port 5174
```

**Module dependencies missing:**
```bash
npm install
```

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👥 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

---

## 📧 Support

For issues, questions, or suggestions, please open an issue in the repository.

---

## 🎯 Roadmap

- [x] Multi-format file support (CSV, XLSX)
- [x] Three-tier classification system (Rule-based, ML, LLM)
- [x] Financial statement generation (P&L, Balance Sheet)
- [x] Journal entry generation with double-entry bookkeeping
- [x] Account ledger management
- [x] Data preprocessing pipeline
- [x] SQLite caching for performance
- [x] CSV data export functionality
- [ ] Multi-user authentication
- [ ] Advanced reporting features
- [ ] Budget planning tools
- [ ] Investment tracking
- [ ] Mobile app
- [ ] Export to accounting software
- [ ] Real-time notifications
- [ ] Custom classification rules

---

**Built with ❤️ using FastAPI, React, and AI**