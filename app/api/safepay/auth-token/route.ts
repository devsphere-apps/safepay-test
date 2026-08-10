import { NextResponse } from "next/server";
import axios from "axios";

export async function POST() {
  try {
    const response = await axios.post(
      "https://sandbox.api.getsafepay.com/client/passport/v1/token",
      {},
      {
        headers: {
          "X-SFPY-MERCHANT-SECRET": process.env.SAFEPAY_SECRET_KEY!,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      "Safepay auth token error:",
      error?.response?.data || error?.message
    );

    return NextResponse.json(
      {
        error: "Failed to create Safepay authentication token",
        details: error?.response?.data || null,
      },
      { status: 500 }
    );
  }
}