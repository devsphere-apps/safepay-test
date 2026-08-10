import { NextRequest, NextResponse } from "next/server";

const safepay = require("@sfpy/node-core")(
  process.env.SAFEPAY_SECRET_KEY,
  {
    authType: "secret",
    host: "https://sandbox.api.getsafepay.com",
  }
);

export async function GET(request: NextRequest) {
  try {
    const tracker = request.nextUrl.searchParams.get("tracker");

    if (!tracker) {
      return NextResponse.json(
        { error: "Tracker is required" },
        { status: 400 }
      );
    }

    const response =
      await safepay.reporter.payments.fetch(tracker);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error(
      "Safepay payment status error:",
      error?.message
    );

    return NextResponse.json(
      {
        error: "Failed to fetch payment status",
      },
      { status: 500 }
    );
  }
}