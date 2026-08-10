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
    const response = await safepay.payments.session.setup({
      merchant_api_key: process.env.SAFEPAY_PUBLIC_KEY,
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

    return NextResponse.json(response);
  } catch (error) {
    console.error("Safepay payment session error:", error);

    return NextResponse.json(
      {
        error: "Failed to create Safepay payment session",
      },
      { status: 500 }
    );
  }
}