# PayPilot AI – Smart Payment Assistant

PayPilot AI is an AI-powered smart payment assistant that helps users understand payment statuses, explore transactions, and get clear answers to payment-related questions.

It combines Gemini AI with PayPal Sandbox checkout to provide an interactive payment assistance experience.

## Features

- **AI Payment Assistant:** Ask payment-related questions and receive AI-generated explanations using Gemini.
- **PayPal Sandbox Checkout:** Test payments securely using PayPal Sandbox.
- **Transaction Dashboard:** View payment information and transaction history.
- **Payment Status Guidance:** Understand pending, completed, and other payment statuses.
- **Markdown Responses:** Get clear, structured answers from the AI assistant.

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- React Markdown

**Backend**
- Python
- FastAPI
- Pydantic
- HTTPX

**AI and Payments**
- Google Gemini API
- PayPal REST API (Sandbox)

## Project Structure

```text
paypilot-ai/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── PayPalCheckout.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/divyanagasai2006/paypilot-ai.git
cd paypilot-ai
```

### 2. Set Up the Backend

Open a terminal:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` folder using `.env.example` as a template.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

Add your own API credentials to `backend/.env`:

```env
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
GEMINI_API_KEY=your_gemini_api_key
```

Use your own credentials. Never upload your actual `.env` file or expose API secrets publicly.

### 4. Run the Backend

From the `backend` folder:

```bash
python -m uvicorn main:app --reload --port 8000
```

Backend API:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

### 5. Set Up the Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

### 6. Run the Frontend

```bash
npm run dev
```

Open the local URL displayed by Vite, usually:

```text
http://localhost:5173
```

Keep both backend and frontend terminals running while using the application.

## Testing

The project was tested with:

- Backend API endpoints using FastAPI Swagger documentation.
- Gemini AI chat responses.
- PayPal Sandbox checkout.
- A successful $5.00 USD Sandbox payment.
- Dashboard transaction display.
- Frontend production build.

**Note:** PayPal Sandbox is used for testing. This project does not process real payments.

## Security

- API credentials are stored in environment variables.
- The actual `.env` file is excluded from Git.
- `.env.example` contains placeholder values only.
- PayPal Sandbox is used for payment testing.

## Author

**Chinnimalli Divya**

- GitHub: https://github.com/divyanagasai2006
- LinkedIn: https://linkedin.com/in/chinnimalli-divya-402067393/

## Repository

https://github.com/divyanagasai2006/paypilot-ai