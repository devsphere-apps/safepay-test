"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    try {
      setLoading(true);

      const response = await fetch("/api/safepay/checkout-url", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout");
      }

      window.location.href = data.checkoutURL;
    } catch (error) {
      console.error(error);
      alert("Failed to start payment");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold">
          Safepay Test Checkout
        </h1>

        <p className="mt-3 text-gray-600">
          Test Product
        </p>

        <p className="mt-6 text-2xl font-bold">
          Rs. 500
        </p>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="mt-8 w-full rounded-lg bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Opening Safepay..." : "Pay Rs. 500"}
        </button>
      </div>
    </main>
  );
}