# PayPilot AI – Smart Payment Assistant

PayPilot AI is an AI-powered smart payment assistant that helps users understand online payments, transactions, refunds, and basic financial concepts.

## Features

- **AI Payment Assistant:** Uses Google Gemini AI to answer payment-related questions.
- **PayPal Sandbox Checkout:** Demonstrates online payments using PayPal Sandbox.
- **Transaction History:** Displays payment transaction details and status.
- **Payment Dashboard:** Provides an overview of payment activity.
- **AI Responses:** Supports structured responses with headings and bullet points.
- **Payment Education:** Explains concepts such as pending payments, completed payments, and refunds.

## Tech Stack

**Frontend**
- React.js
- Vite
- JavaScript
- Tailwind CSS
- React Markdown

**Backend**
- Python
- FastAPI
- HTTPX

**AI Integration**
- Google Gemini API

**Payment Integration**
- PayPal Sandbox API

## Project Structure

```text
paypilot-ai/
├── backend/
│   ├── main.py
│   └── .env
├── frontend/
│   ├── src/
│   └── package.json
├── .gitignore
└── README.md
```

## Getting Started

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd paypilot-ai
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the backend dependencies using the project's dependency file.

Configure your PayPal Sandbox and Gemini API credentials in `backend/.env`. Never share or upload API secrets.

Start the backend:

```bash
python -m uvicorn main:app --reload --port 8000
```

Backend URL: `http://127.0.0.1:8000`

API documentation: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Testing

- Tested Gemini AI responses through the frontend and backend.
- Tested PayPal Sandbox checkout.
- Successfully completed a $5.00 USD Sandbox transaction.
- Verified the completed transaction in the dashboard.

**Note:** This project uses PayPal Sandbox for demonstration and testing. It does not connect to real bank accounts or process live payments.

## Security

- API credentials are stored in environment variables.
- `.env`, virtual environments, and `node_modules` are excluded using `.gitignore`.
- Never commit API keys or private credentials.

## Author

**Divya Chinnimalli**

GitHub: https://github.com/divyanagasai2006

LinkedIn: https://linkedin.com/in/chinnimalli-divya-402067393/
