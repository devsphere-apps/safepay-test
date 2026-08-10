import { NextResponse } from "next/server";

const safepay = require("@sfpy/node-core")(
  process.env.SAFEPAY_SECRET_KEY,
  {
    authType: "secret",
    host: "https://sandbox.api.getsafepay.com",
  }
);

export async function POST() {
  try {
    // 1. Create payment tracker
    const paymentSession =
      await safepay.payments.session.setup({
        merchant_api_key:
          process.env.SAFEPAY_PUBLIC_KEY,
        intent: "CYBERSOURCE",
        mode: "payment",
        entry_mode: "raw",
        currency: "PKR",
        amount: 50000,
        metadata: {
          order_id: "test-order-001",
        },
        include_fees: false,
      });

    const tracker =
      paymentSession.data.tracker.token;

    // 2. Create temporary authentication token
    const authResponse = await fetch(
      "https://sandbox.api.getsafepay.com/client/passport/v1/token",
      {
        method: "POST",
        headers: {
          "X-SFPY-MERCHANT-SECRET":
            process.env.SAFEPAY_SECRET_KEY!,
        },
      }
    );

    if (!authResponse.ok) {
      throw new Error("Failed to create auth token");
    }

    const authData = await authResponse.json();

    const authToken = authData.data;

    // 3. Create Safepay Checkout URL
    const checkoutURL =
      safepay.checkout.createCheckoutUrl({
        tracker,
        tbt: authToken,
        env: "sandbox",
        source: "hosted",
        redirect_url:
          "http://localhost:3000/payment/success",
        cancel_url:
          "http://localhost:3000/payment/cancel",
      });

    return NextResponse.json({
      tracker,
      checkoutURL,
    });
  } catch (error: any) {
    console.error(
      "Safepay checkout error:",
      error?.response?.data ||
      error?.message
    );

    return NextResponse.json(
      {
        error: "Failed to create checkout URL",
        details:
          error?.response?.data || null,
      },
      { status: 500 }
    );
  }
}