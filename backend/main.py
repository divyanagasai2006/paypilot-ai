
import os

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
PAYPAL_BASE_URL = os.getenv(
    "PAYPAL_BASE_URL",
    "https://api-m.sandbox.paypal.com"
)


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-3.5-flash"

GEMINI_API_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/"
    f"models/{GEMINI_MODEL}:generateContent"
)


app = FastAPI(
    title="PayPilot AI",
    description="AI-powered smart payment assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def check_credentials():
    if not PAYPAL_CLIENT_ID or not PAYPAL_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="PayPal credentials are missing. Check backend .env file."
        )


async def get_paypal_access_token():
    check_credentials()

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{PAYPAL_BASE_URL}/v1/oauth2/token",
            auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET),
            data={"grant_type": "client_credentials"},
            headers={
                "Accept": "application/json",
                "Accept-Language": "en_US",
            },
        )

    if response.is_error:
        raise HTTPException(
            status_code=502,
            detail="Could not authenticate with PayPal Sandbox."
        )

    return response.json()["access_token"]


@app.get("/")
async def home():
    return {
        "message": "Welcome to PayPilot AI!",
        "status": "Backend is running"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "application": "PayPilot AI"
    }


@app.get("/api/config")
async def get_config():
    check_credentials()
    return {
        "paypal_client_id": PAYPAL_CLIENT_ID,
        "currency": "USD"
    }



@app.post("/api/orders")
async def create_order():
    access_token = await get_paypal_access_token()

    order_payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "amount": {
                    "currency_code": "USD",
                    "value": "5.00"
                },
                "description": "PayPilot AI Sandbox Test Payment"
            }
        ]
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{PAYPAL_BASE_URL}/v2/checkout/orders",
            json=order_payload,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
        )

    if response.is_error:
        raise HTTPException(
            status_code=502,
            detail="PayPal could not create the payment order."
        )

    order_data = response.json()

    return {
        "id": order_data["id"],
        "status": order_data["status"]
    }


class ChatRequest(BaseModel):
    message: str


@app.post("/api/ai/chat")
async def ai_chat(request: ChatRequest):

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is missing."
        )

    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter a message."
        )

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": (
                            "You are PayPilot AI, a smart payment assistant. "
                            "Help users understand payments, transactions, "
                            "and basic financial concepts. "
                            "Give simple, clear and helpful answers. "
                            "Never claim to access real bank accounts "
                            "or transactions unless data is provided.\n\n"
                            f"User: {request.message}"
                        )
                    }
                ]
            }
        ]
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            GEMINI_API_URL,
            json=payload,
            headers={
                "x-goog-api-key": GEMINI_API_KEY,
                "Content-Type": "application/json"
            }
        )

    if response.is_error:
        print("GEMINI ERROR:", response.text)
        raise HTTPException(
            status_code=502,
            detail="Gemini AI could not generate a response."
        )

    result = response.json()

    try:
        answer = result["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        raise HTTPException(
            status_code=502,
            detail="Gemini returned an unexpected response."
        )

    return {
        "reply": answer,
        "model": GEMINI_MODEL
    }




@app.post("/api/orders/{order_id}/capture")
async def capture_order(order_id: str):
    access_token = await get_paypal_access_token()

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
        )

    if response.is_error:
        raise HTTPException(
            status_code=502,
            detail="PayPal could not capture this payment."
        )

    payment_data = response.json()
    print("PAYPAL CAPTURE RESPONSE:", payment_data)

    return {
        "order_id": payment_data.get("id"),
        "status": payment_data.get("status"),
        "payment_details": payment_data.get("purchase_units", [])
    }
@app.get("/api/orders/{order_id}")
async def get_order_details(order_id: str):
    access_token = await get_paypal_access_token()

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
        )

    if response.is_error:
        raise HTTPException(
            status_code=502,
            detail="Could not fetch PayPal order details."
        )

    order_data = response.json()

    return {
        "order_id": order_data.get("id"),
        "status": order_data.get("status"),
        "purchase_units": order_data.get("purchase_units", [])
    }

