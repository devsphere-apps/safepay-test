import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // IMPORTANT: read the raw body
    const rawBody = await request.text();

    const signature = request.headers.get("x-sfpy-signature");

    if (!signature) {
      console.error("Safepay webhook: missing signature");

      return NextResponse.json(
        { error: "Missing webhook signature" },
        { status: 401 }
      );
    }

    const secret = process.env.SAFE_PAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("Safepay webhook: secret is not configured");

      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Safepay uses HMAC-SHA512
    const expectedSignature = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    // Constant-time comparison
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const receivedBuffer = Buffer.from(signature, "utf8");

    const isValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValid) {
      console.error("Safepay webhook: invalid signature");

      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Signature is valid — now parse the payload
    const body = JSON.parse(rawBody);

    console.log("✅ Safepay webhook verified:");
    console.log(JSON.stringify(body, null, 2));

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error("Safepay webhook error:", error);

    return NextResponse.json(
      {
        received: false,
        error: "Invalid webhook payload",
      },
      { status: 400 }
    );
  }
}