
import { useEffect, useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";

function PayPalCheckout({ onPaymentSuccess }) {
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/config")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load PayPal configuration.");
        }
        return response.json();
      })
      .then((data) => setClientId(data.paypal_client_id))
      .catch((err) => setError(err.message));
  }, []);

  async function createOrder() {
    const response = await fetch("http://localhost:8000/api/orders", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Unable to create PayPal order.");
    }

    const data = await response.json();
    return data.id;
  }

  async function captureOrder(data) {
    setPaymentStatus("Processing payment...");

    const response = await fetch(
      `http://localhost:8000/api/orders/${data.orderID}/capture`,
      { method: "POST" }
    );

    if (!response.ok) {
      throw new Error("Payment capture failed.");
    }

    const result = await response.json();

    const capture = result.payment_details?.[0]?.payments?.captures?.[0];

    const transaction = {
      id: capture?.id || result.order_id,
      name: "PayPal Sandbox Payment",
      category: "Online Payment",
      date: new Date().toLocaleString(),
      amount: `$${capture?.amount?.value || "5.00"} USD`,
      status: capture?.status || result.status,
      icon: "$",
      color: "bg-blue-100 text-blue-600",
    };

    setPaymentStatus(`Payment status: ${result.status}`);

    if (result.status === "COMPLETED" && capture?.status === "COMPLETED") {
      onPaymentSuccess?.(transaction);
    }
  }

  if (error) {
    return <p className="mt-4 text-sm text-red-600">{error}</p>;
  }

  if (!clientId) {
    return <p className="mt-4 text-sm text-slate-500">Loading PayPal...</p>;
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-bold text-slate-900">
        PayPal Sandbox Checkout
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        Test payment amount: $5.00 USD
      </p>

      <div className="mt-5">
        <PayPalScriptProvider
          options={{
            clientId,
            currency: "USD",
            intent: "capture",
          }}
        >
          <PayPalButtons
            style={{ layout: "vertical" }}
            createOrder={createOrder}
            onApprove={captureOrder}
            onError={(err) => {
              console.error("PayPal error:", err);
              setPaymentStatus("Something went wrong. Please try again.");
            }}
          />
        </PayPalScriptProvider>
      </div>

      {paymentStatus && (
        <p className="mt-4 text-sm font-semibold text-blue-700">
          {paymentStatus}
        </p>
      )}
    </div>
  );
}

export default PayPalCheckout;
