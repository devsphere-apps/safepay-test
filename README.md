# Safepay + Next.js App Router Integration

A working **Safepay Sandbox payment integration** built with **Next.js App Router**, **TypeScript**, and the Safepay Node SDK.

This project was created as a practical Proof of Concept to understand and test how Safepay can be integrated into a Pakistani marketplace/web application.

> **Status:** ✅ Working Sandbox Integration
> **Environment:** Safepay Sandbox
> **Framework:** Next.js App Router
> **Language:** TypeScript
> **Payment Gateway:** Safepay
> **Checkout:** Safepay Hosted Checkout

---

## 📌 Important

This repository is a **Sandbox Proof of Concept**, not a production-ready payment system.

The complete Safepay payment flow, payment status verification, webhook delivery, and webhook signature verification have been successfully tested.

Database order fulfillment, production deployment, idempotency, production credentials, and other production-hardening steps are intentionally left for the next phase.

---

# 🚀 What We Built

The complete tested flow is:

```text
Customer
   ↓
Next.js Checkout Page
   ↓
Create Safepay Payment Tracker
   ↓
Create Safepay Authentication Token
   ↓
Generate Safepay Checkout URL
   ↓
Redirect Customer to Safepay
   ↓
Customer Completes Payment
   ↓
┌───────────────────────────────┐
│                               │
▼                               ▼
Success Redirect                Webhook
│                               │
▼                               ▼
/payment/success                /api/safepay/webhook
│                               │
▼                               ▼
Payment Status API              Signature Verification
│                               │
▼                               ▼
TRACKER_ENDED                   payment.succeeded
│                               │
▼                               ▼
Show Success                    HTTP 200
```

---

# ✨ Features Implemented

* [x] Next.js App Router
* [x] TypeScript
* [x] Safepay Sandbox account
* [x] Safepay API credentials
* [x] `@sfpy/node-core`
* [x] Axios dependency
* [x] Payment tracker creation
* [x] Authentication token generation
* [x] Safepay Checkout URL generation
* [x] Safepay Hosted Checkout
* [x] Sandbox card payment
* [x] Payment success redirect
* [x] Payment cancellation flow
* [x] Payment status endpoint
* [x] `TRACKER_ENDED` verification
* [x] Public webhook endpoint using ngrok
* [x] Safepay webhook endpoint configuration
* [x] `payment.succeeded` subscription
* [x] `payment.failed` subscription
* [x] Webhook signature verification
* [x] HMAC-SHA512 verification
* [x] Real `payment.succeeded` webhook received
* [x] Webhook returned HTTP 200
* [x] Transaction reflected in Safepay Sandbox Dashboard
* [x] Tested complete Sandbox payment flow

---

# 🛠 Tech Stack

* Next.js 16
* Next.js App Router
* TypeScript
* Node.js
* `@sfpy/node-core`
* Axios
* Safepay Sandbox
* ngrok

---

# 📦 Requirements

Before starting:

* Node.js 18+
* npm
* Safepay Sandbox account
* Safepay Sandbox API credentials
* Safepay webhook secret
* ngrok account for local webhook testing

---

# 🏗 Installation

Create a Next.js App Router project:

```bash
npx create-next-app@latest safepay-test
```

Move into the project:

```bash
cd safepay-test
```

Install Safepay:

```bash
npm install @sfpy/node-core
```

### Important: Install Axios

During this integration we encountered:

```text
Error: Module not found: Can't resolve 'axios'
```

The error originated from:

```text
@sfpy/node-core/cjs/net/AxiosHttpClient.js
```

Install Axios explicitly:

```bash
npm install axios
```

Verify:

```bash
npm list @sfpy/node-core
npm list axios
```

The version used during this project was:

```text
@sfpy/node-core@0.3.5
```

and:

```text
axios@1.19.0
```

> SDK versions may change. Always check the actual version installed in your project.

---

# 🔐 Environment Variables

Create:

```text
.env.local
```

Add:

```env
SAFEPAY_SECRET_KEY=your_safepay_secret_key
SAFEPAY_PUBLIC_KEY=your_safepay_public_key
SAFE_PAY_WEBHOOK_SECRET=your_webhook_secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### ⚠️ Security

Never commit:

```text
.env.local
```

to GitHub.

Your `.gitignore` should contain:

```gitignore
.env
.env.local
.env.*.local
```

Never expose:

```text
SAFEPAY_SECRET_KEY
SAFE_PAY_WEBHOOK_SECRET
```

through:

```text
NEXT_PUBLIC_*
```

Private credentials must remain server-side.

---

# 📁 Project Structure

The important routes created during this integration are:

```text
app/
├── api/
│   └── safepay/
│       │
│       ├── create-payment/
│       │   └── route.ts
│       │
│       ├── auth-token/
│       │   └── route.ts
│       │
│       ├── checkout-url/
│       │   └── route.ts
│       │
│       ├── payment-status/
│       │   └── route.ts
│       │
│       └── webhook/
│           └── route.ts
│
├── checkout/
│   └── page.tsx
│
└── payment/
    ├── success/
    │   └── page.tsx
    │
    └── cancel/
        └── page.tsx
```

---

# 🔄 Complete Integration Flow

## Step 1 — Create Payment Tracker

When the customer starts checkout, the server creates a Safepay payment tracker.

Example:

```text
POST /api/safepay/create-payment
```

The payment tracker contains information such as:

```text
tracker token
environment
state
intent
mode
entry mode
purchase totals
metadata
```

We used metadata to connect the Safepay transaction with our application's order:

```json
{
  "order_id": "test-order-001"
}
```

### Why metadata matters

The `order_id` lets your webhook identify which internal order belongs to the Safepay payment.

For a real marketplace:

```text
Your Order
     ↓
order_id = ORD-12345
     ↓
Safepay metadata
     ↓
payment.succeeded webhook
     ↓
Find ORD-12345
     ↓
Mark order PAID
```

---

# 🔑 Step 2 — Create Authentication Token

Create a temporary Safepay authentication token from the server.

Endpoint:

```text
POST /api/safepay/auth-token
```

During development we initially had an SDK resource error:

```text
Cannot read properties of undefined (reading 'create')
```

The problem was that we initially used an incorrect SDK resource path.

The installed SDK exposed:

```text
auth
```

and:

```text
checkout
```

but the exact available methods needed to be inspected.

### Useful debugging technique

Inspect the installed SDK:

```bash
node -e "const s=require('@sfpy/node-core')('test',{authType:'secret',host:'https://sandbox.api.getsafepay.com'}); console.dir(Object.keys(s), {depth:3})"
```

This showed:

```text
_api
customers
order
payments
guests
user
auth
invoice
reporter
client
errors
_requestSender
SafepayResource
checkout
```

Then inspect a resource:

```bash
node -e "const s=require('@sfpy/node-core')('test',{authType:'secret',host:'https://sandbox.api.getsafepay.com'}); console.dir(s.checkout, {depth:5})"
```

This revealed:

```text
{
  createCheckoutUrl: [Function: createCheckoutUrl]
}
```

### Lesson

Do not blindly copy SDK method names from old tutorials.

Check the exact SDK version installed in your project.

---

# 🔗 Step 3 — Generate Checkout URL

After creating:

```text
Payment Tracker
```

and:

```text
Authentication Token
```

generate the Safepay Checkout URL.

Endpoint:

```text
POST /api/safepay/checkout-url
```

The generated URL contains information such as:

```text
environment
tracker
authentication token
source
redirect_url
cancel_url
```

Example:

```text
https://sandbox.api.getsafepay.com/embedded/
```

---

# ⚠️ Checkout URL `undefined` Issue

During development we initially received:

```text
undefined?environment=sandbox&tracker=...
```

instead of:

```text
https://sandbox.api.getsafepay.com/embedded/?environment=sandbox&tracker=...
```

### Debugging

We inspected the installed SDK implementation:

```bash
node -e "const s=require('@sfpy/node-core')('test',{authType:'secret',host:'https://sandbox.api.getsafepay.com'}); console.dir(s.checkout.createCheckoutUrl.toString())"
```

The implementation showed that the base URL is selected according to the environment:

```text
const baseUrl = hostUrls[env];
```

The correct environment configuration produced:

```text
https://sandbox.api.getsafepay.com/embedded/
```

### Lesson

If an SDK returns:

```text
undefined
```

inspect the actual installed SDK implementation and verify the environment/configuration instead of guessing.

---

# 💳 Step 4 — Safepay Hosted Checkout

The customer is redirected to Safepay's Hosted Checkout.

Example flow:

```text
Your Website
     ↓
Safepay Checkout
     ↓
Customer enters payment details
     ↓
Payment authentication
     ↓
Payment capture
```

We successfully tested Sandbox card payments.

Example test payment:

```text
PKR 500
```

The transaction appeared in the Safepay Sandbox Dashboard.

---

# ↩️ Step 5 — Success Redirect

After successful payment, Safepay redirects the customer to:

```text
/payment/success?tracker=TRACKER_TOKEN
```

Example:

```text
/payment/success?tracker=track_xxxxxxxxx
```

### Important

The success page is a **customer-facing result page**.

It should not be the only mechanism used to mark an order as paid.

---

# ❌ Step 6 — Payment Cancel

A separate cancellation route can be used:

```text
/payment/cancel
```

This allows the application to show the customer that checkout was cancelled.

---

# 🔎 Step 7 — Payment Status Verification

We created:

```text
GET /api/safepay/payment-status?tracker=TRACKER_TOKEN
```

The backend uses the Safepay Reporter API to fetch the payment status.

The important successful state is:

```text
TRACKER_ENDED
```

Example:

```json
{
  "ok": true,
  "data": {
    "state": "TRACKER_ENDED"
  }
}
```

The success page checks this result before displaying:

```text
Payment Successful
```

---

# ⚠️ Important: Browser Redirect Is Not Your Source of Truth

Do not implement:

```text
Customer reaches /payment/success
        ↓
Immediately mark order PAID
```

Instead:

```text
Customer reaches /payment/success
        ↓
Show/check payment status
        ↓
Safepay webhook confirms payment
        ↓
Server processes payment
        ↓
Order becomes PAID
```

For production order fulfillment, the webhook should be the authoritative payment event.

---

# 🌐 Step 8 — Local Webhook Testing with ngrok

Safepay cannot send a webhook directly to:

```text
http://localhost:3000
```

Therefore we used ngrok.

Start Next.js:

```bash
npm run dev
```

Start ngrok:

```bash
ngrok http 3000
```

Example:

```text
https://example.ngrok-free.dev
    ↓
http://localhost:3000
```

Our webhook URL becomes:

```text
https://example.ngrok-free.dev/api/safepay/webhook
```

### Important

Keep ngrok running while testing.

If the ngrok URL changes, update the Safepay endpoint.

For production, replace ngrok with your permanent HTTPS domain.

---

# 🪝 Step 9 — Create Webhook Endpoint

Create:

```text
app/api/safepay/webhook/route.ts
```

The endpoint:

```text
POST /api/safepay/webhook
```

was registered in the Safepay Dashboard.

---

# 📡 Step 10 — Subscribe to Webhook Events

Creating the endpoint alone is not enough.

The endpoint must be subscribed to the events your application needs.

For this project we subscribed to:

```text
payment.succeeded
payment.failed
```

### Common mistake

We initially had an endpoint configured but Safepay showed:

```text
NO EVENT
```

and:

```text
No webhook notification sent for this event
```

The endpoint existed, but it was not subscribed to the required event.

### Fix

Go to:

```text
Safepay Dashboard
→ Developers
→ Endpoints
→ Manage endpoint subscriptions
```

Subscribe to:

```text
payment.succeeded
payment.failed
```

Then verify the endpoint no longer shows:

```text
NO EVENT
```

---

# 🧪 Step 11 — Test Webhook Endpoint Locally

Before testing Safepay itself, test the endpoint.

```bash
curl -X POST http://localhost:3000/api/safepay/webhook \
  -H "Content-Type: application/json" \
  -d '{"test":true,"message":"Safepay webhook test"}'
```

Expected:

```json
{
  "received": true
}
```

---

# 🌍 Step 12 — Test Public Webhook

After starting ngrok:

```bash
ngrok http 3000
```

test:

```bash
curl -X POST https://YOUR-NGROK-DOMAIN.ngrok-free.dev/api/safepay/webhook \
  -H "Content-Type: application/json" \
  -d '{"test":true,"message":"Public webhook test"}'
```

Expected:

```json
{
  "received": true
}
```

This confirms:

```text
Internet
   ↓
ngrok
   ↓
localhost:3000
   ↓
Next.js
   ↓
Webhook Route
```

---

# 🔐 Step 13 — Webhook Signature Verification

The webhook must not blindly trust every incoming HTTP request.

We implemented signature verification using the webhook secret.

The request body must first be read as raw text:

```ts
const rawBody = await request.text();
```

Then read the Safepay signature:

```ts
const signature =
  request.headers.get("x-sfpy-signature");
```

The expected HMAC-SHA512 signature is calculated:

```ts
const expectedSignature = crypto
  .createHmac("sha512", secret)
  .update(rawBody)
  .digest("hex");
```

Then compare:

```text
Received Signature
        ↓
Expected Signature
        ↓
Constant-time comparison
        ↓
Valid?
```

Only after successful verification should the JSON be parsed:

```ts
const body = JSON.parse(rawBody);
```

---

# 🧩 Current Webhook Implementation

Our tested webhook structure is:

```ts
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    const signature =
      request.headers.get("x-sfpy-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature" },
        { status: 401 }
      );
    }

    const secret =
      process.env.SAFE_PAY_WEBHOOK_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer =
      Buffer.from(expectedSignature, "utf8");

    const receivedBuffer =
      Buffer.from(signature, "utf8");

    const isValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody);

    console.log("✅ Safepay webhook verified:");
    console.log(JSON.stringify(body, null, 2));

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Safepay webhook error:",
      error
    );

    return NextResponse.json(
      {
        received: false,
        error: "Invalid webhook payload",
      },
      { status: 400 }
    );
  }
}
```

---

# 📨 Step 14 — Real Safepay Webhook

After configuring the endpoint and subscriptions, we successfully received a real:

```text
payment.succeeded
```

event.

The webhook contained:

```json
{
  "token": "evt_xxxxxxxxx",
  "version": "2.0.0",
  "type": "payment.succeeded",
  "endpoint": "https://YOUR-ENDPOINT/api/safepay/webhook",
  "data": {
    "tracker": "track_xxxxxxxxx",
    "intent": "CYBERSOURCE",
    "state": "TRACKER_ENDED",
    "amount": 50000,
    "currency": "PKR",
    "customer_email": "customer@example.com",
    "metadata": {
      "order_id": "test-order-001"
    }
  }
}
```

Our server logged:

```text
✅ Safepay webhook verified
POST /api/safepay/webhook 200
```

This proves:

```text
Safepay
   ↓
payment.succeeded
   ↓
Public HTTPS endpoint
   ↓
ngrok
   ↓
Next.js
   ↓
Signature verification
   ↓
Webhook accepted
   ↓
HTTP 200
```

---

# 🧪 Step 15 — Testing with Safepay Test Event

After configuring the webhook endpoint and event subscriptions, use Safepay's test-event functionality to verify webhook delivery.

Keep both running:

### Terminal 1

```bash
npm run dev
```

### Terminal 2

```bash
ngrok http 3000
```

Then trigger the Safepay webhook test event.

Expected Next.js output:

```text
POST /api/safepay/webhook 200
```

Expected ngrok output:

```text
POST /api/safepay/webhook 200 OK
```

---

# 🔍 Debugging with ngrok

ngrok provides a local inspection interface:

```text
http://127.0.0.1:4040
```

This is useful for inspecting:

```text
Request
Headers
Body
Response
Status Code
```

It helped us confirm that Safepay was actually reaching our Next.js webhook endpoint.

---

# 🐛 Problems We Faced

This section is intentionally included so future developers do not repeat the same issues.

---

## Problem 1 — Axios Module Not Found

### Error

```text
Error: Module not found: Can't resolve 'axios'
```

### Cause

The installed Safepay SDK required Axios in our project setup.

### Fix

```bash
npm install axios
```

Then restart:

```bash
npm run dev
```

---

## Problem 2 — `auth.passport.create()` Undefined

### Error

```text
Cannot read properties of undefined (reading 'create')
```

### Cause

We initially assumed an incorrect SDK structure.

### Fix

Inspect the actual SDK:

```bash
node -e "const s=require('@sfpy/node-core')('test',{authType:'secret',host:'https://sandbox.api.getsafepay.com'}); console.dir(Object.keys(s), {depth:3})"
```

Then inspect individual resources.

### Lesson

Always inspect the installed SDK version/API instead of blindly copying examples.

---

## Problem 3 — Checkout URL Returned `undefined`

### Error

```text
undefined?environment=sandbox&tracker=...
```

### Cause

The Checkout URL generator could not resolve the expected environment/base URL.

### Fix

Inspect:

```ts
s.checkout.createCheckoutUrl
```

and verify:

```text
environment
```

and:

```text
sandbox
```

are correctly configured.

The resulting URL became:

```text
https://sandbox.api.getsafepay.com/embedded/
```

---

## Problem 4 — Payment Success Page Returned 404

### Error

```text
GET /payment/success?tracker=... 404
```

### Cause

The route did not exist.

### Fix

Create:

```text
app/payment/success/page.tsx
```

After that:

```text
GET /payment/success?tracker=... 200
```

---

## Problem 5 — Incorrect Payment Status Property

The Safepay response contains tracker information.

The underlying Safepay response can contain:

```text
data.tracker.state
```

Our own API route returned a flattened structure:

```text
data.state
```

Therefore our success page needed to check the response shape returned by **our API route**.

### Lesson

Inspect the actual response from your own API before assuming the nested structure.

---

## Problem 6 — Webhook Endpoint Showed `NO EVENT`

### Problem

The endpoint existed but Safepay was not delivering events.

The dashboard showed:

```text
NO EVENT
```

and:

```text
No webhook notification sent for this event
```

### Cause

The endpoint was not subscribed to the required events.

### Fix

Subscribe to:

```text
payment.succeeded
payment.failed
```

---

## Problem 7 — Localhost Webhook Was Not Reachable

### Problem

Safepay cannot directly send a request to:

```text
http://localhost:3000
```

### Fix

Use:

```bash
ngrok http 3000
```

and configure:

```text
https://YOUR-NGROK-DOMAIN.ngrok-free.dev/api/safepay/webhook
```

---

## Problem 8 — Public Endpoint Worked but Safepay Was Not Sending

We manually tested:

```bash
curl -X POST https://YOUR-NGROK-DOMAIN.ngrok-free.dev/api/safepay/webhook
```

and received:

```json
{
  "received": true
}
```

This only proved:

```text
Our public endpoint works.
```

It did **not** prove:

```text
Safepay → webhook
```

was working.

The actual Safepay event subscription needed to be configured.

---

## Problem 9 — Webhook Signature Verification

The webhook must not simply do:

```ts
const body = await request.json();
```

before validating the signature.

Instead:

```ts
const rawBody = await request.text();
```

Then:

```text
raw body
   ↓
HMAC-SHA512
   ↓
compare with X-SFPY-SIGNATURE
   ↓
valid?
   ↓
parse JSON
```

---

# 🧠 Important Lessons Learned

## 1. Don't blindly trust SDK examples

SDK versions change.

Check:

```bash
npm list @sfpy/node-core
```

Then inspect the actual API exposed by your installed version.

---

## 2. Separate payment flow from webhook flow

These are two different paths:

```text
CUSTOMER FLOW

Checkout
   ↓
Safepay
   ↓
Redirect
   ↓
Success Page
```

and:

```text
SERVER FLOW

Safepay
   ↓
Webhook
   ↓
Signature verification
   ↓
Order processing
```

Both are needed.

---

## 3. The success page is not your fulfillment system

Do not do:

```text
success page
   ↓
mark order PAID
```

Instead:

```text
payment.succeeded webhook
   ↓
verify
   ↓
validate
   ↓
mark order PAID
```

---

## 4. Store your own order ID in Safepay metadata

Example:

```json
{
  "order_id": "ORD-12345"
}
```

Then the webhook can identify your internal order:

```text
Safepay webhook
       ↓
metadata.order_id
       ↓
ORD-12345
       ↓
Database order
```

---

## 5. Always verify amount and currency

Before marking an order as paid, compare:

```text
Safepay amount
        vs
Your order amount
```

and:

```text
Safepay currency
        vs
Your order currency
```

Example:

```text
Expected:
50000 PKR

Received:
50000 PKR

→ valid
```

Never blindly trust the `order_id` alone.

---

# 🗄️ Next Phase: Database Order Integration

The current webhook successfully verifies and receives the payment.

The next step is to connect it to a real database.

Production flow:

```text
payment.succeeded
       ↓
Verify signature
       ↓
Verify event type
       ↓
Verify state
       ↓
Read order_id
       ↓
Find order
       ↓
Verify amount
       ↓
Verify currency
       ↓
Check whether already PAID
       ↓
Mark order PAID
       ↓
Store Safepay tracker
       ↓
Return 200
```

Example conceptual database update:

```ts
await db.order.update({
  where: {
    id: orderId,
  },
  data: {
    status: "PAID",
    paymentProvider: "SAFEPAY",
    paymentTracker: tracker,
    paidAt: new Date(),
  },
});
```

The exact implementation depends on the database/ORM used by the application.

---

# 🔁 Idempotency

This is extremely important for production.

A payment can result in multiple webhook deliveries/attempts.

Your system must safely handle:

```text
Webhook #1
   ↓
Order → PAID

Webhook #2
   ↓
Order already PAID
   ↓
Do nothing
   ↓
Return 200
```

Never create duplicate orders or fulfill the same order twice.

A useful database constraint is:

```text
paymentTracker UNIQUE
```

or an equivalent idempotency mechanism.

---

# ❌ Failed Payments

The application should also handle:

```text
payment.failed
```

Example:

```text
payment.failed
      ↓
Find order
      ↓
Record failed attempt
      ↓
Keep order unpaid
      ↓
Allow customer to retry
```

Do not automatically treat a failed attempt as a permanently failed order if Safepay allows the customer to retry the payment.

---

# 🧪 Production Test Checklist

Before moving from Sandbox to production:

```text
[ ] Successful payment
[ ] Failed payment
[ ] Cancelled checkout
[ ] Payment retry
[ ] Duplicate webhook
[ ] Webhook signature failure
[ ] Missing webhook signature
[ ] Invalid order_id
[ ] Incorrect amount
[ ] Incorrect currency
[ ] Unknown tracker
[ ] Multiple payment attempts
[ ] Network timeout
[ ] Webhook retry
[ ] Database failure
```

---

# 🚀 Production Checklist

Before going live:

```text
[ ] Replace Sandbox credentials
[ ] Configure Live Safepay credentials
[ ] Use permanent HTTPS domain
[ ] Replace ngrok
[ ] Configure production webhook endpoint
[ ] Subscribe to required production events
[ ] Configure production webhook secret
[ ] Implement database order updates
[ ] Implement idempotency
[ ] Verify amount
[ ] Verify currency
[ ] Handle failed payments
[ ] Handle cancelled payments
[ ] Secure environment variables
[ ] Rotate exposed/test credentials
[ ] Add logging
[ ] Add monitoring
[ ] Test production webhook
[ ] Perform small production payment
```

---

# 📊 Current Project Status

| Component                        | Status |
| -------------------------------- | ------ |
| Next.js App Router               | ✅      |
| TypeScript                       | ✅      |
| Safepay SDK                      | ✅      |
| Sandbox credentials              | ✅      |
| Payment tracker                  | ✅      |
| Authentication token             | ✅      |
| Checkout URL                     | ✅      |
| Hosted Checkout                  | ✅      |
| Sandbox payment                  | ✅      |
| Success redirect                 | ✅      |
| Payment status API               | ✅      |
| `TRACKER_ENDED` verification     | ✅      |
| ngrok webhook tunnel             | ✅      |
| Safepay webhook endpoint         | ✅      |
| `payment.succeeded` subscription | ✅      |
| `payment.failed` subscription    | ✅      |
| Webhook signature verification   | ✅      |
| Real webhook delivery            | ✅      |
| Webhook HTTP 200                 | ✅      |
| Safepay Sandbox Dashboard        | ✅      |
| Database order integration       | ⏳      |
| Payment fulfillment              | ⏳      |
| Webhook idempotency              | ⏳      |
| Production deployment            | ⏳      |
| Production credentials           | ⏳      |
| Production testing               | ⏳      |

---

# 🔒 Security Checklist

Never commit:

```text
.env.local
```

Never expose:

```text
SAFEPAY_SECRET_KEY
SAFE_PAY_WEBHOOK_SECRET
```

Never put private credentials in:

```text
NEXT_PUBLIC_*
```

Before making this repository public, run:

```bash
git status
```

Then:

```bash
git check-ignore .env.local
```

Expected:

```text
.env.local
```

Also inspect staged files:

```bash
git diff --cached
```

Search the repository for accidentally committed secrets before pushing.

If a real credential has already been exposed, rotate it before using the repository publicly.

---

# 🧪 Useful Commands

Start development server:

```bash
npm run dev
```

Start ngrok:

```bash
ngrok http 3000
```

Check installed Safepay SDK:

```bash
npm list @sfpy/node-core
```

Check Axios:

```bash
npm list axios
```

Check webhook locally:

```bash
curl -X POST http://localhost:3000/api/safepay/webhook \
  -H "Content-Type: application/json" \
  -d '{"test":true}'
```

Check public webhook:

```bash
curl -X POST https://YOUR-NGROK-DOMAIN.ngrok-free.dev/api/safepay/webhook \
  -H "Content-Type: application/json" \
  -d '{"test":true}'
```

Check payment status:

```bash
curl "http://localhost:3000/api/safepay/payment-status?tracker=TRACKER_TOKEN"
```

---

# 📚 Recommended Reproduction Order

If another developer clones this repository and wants to reproduce the integration without facing the issues encountered during development, follow this order:

```text
1. Install Node.js 18+
        ↓
2. Install dependencies
        ↓
3. Install @sfpy/node-core
        ↓
4. Install axios
        ↓
5. Configure .env.local
        ↓
6. Create Safepay Sandbox account
        ↓
7. Copy API credentials
        ↓
8. Create payment tracker
        ↓
9. Create authentication token
        ↓
10. Generate Checkout URL
        ↓
11. Create /payment/success
        ↓
12. Test Hosted Checkout
        ↓
13. Implement payment-status
        ↓
14. Verify TRACKER_ENDED
        ↓
15. Create webhook route
        ↓
16. Start ngrok
        ↓
17. Register webhook endpoint
        ↓
18. Subscribe to payment.succeeded
        ↓
19. Subscribe to payment.failed
        ↓
20. Add webhook secret
        ↓
21. Implement signature verification
        ↓
22. Send Safepay test event
        ↓
23. Make Sandbox payment
        ↓
24. Verify payment.succeeded webhook
        ↓
25. Implement database order handling
        ↓
26. Implement idempotency
        ↓
27. Move to production
```

---

# 🎯 What This Repository Demonstrates

This project demonstrates how to integrate a Pakistani payment gateway into a modern Next.js application using a server-side payment architecture.

The implemented Sandbox lifecycle is:

```text
Create Tracker
      ↓
Create Authentication Token
      ↓
Generate Checkout URL
      ↓
Hosted Checkout
      ↓
Customer Payment
      ↓
Redirect
      ↓
Payment Status Verification
      ↓
Webhook Delivery
      ↓
Webhook Signature Verification
      ↓
payment.succeeded
      ↓
HTTP 200
```

The project was intentionally developed step-by-step and documents the real integration problems encountered during implementation so future developers can reproduce the working setup without repeating those mistakes.

---

# ⚠️ Disclaimer

This repository is a **Safepay Sandbox Proof of Concept**.

It is intended for:

* Learning
* Development
* Testing
* Understanding Safepay integration
* Building a foundation for a marketplace/payment system

It should **not** be considered production-ready until:

* Database order management is implemented
* Payment fulfillment is implemented
* Webhook idempotency is implemented
* Amount/currency verification is implemented
* Production credentials are configured
* A permanent HTTPS webhook endpoint is deployed
* Production webhook behavior is tested
* Security and monitoring requirements are implemented

---

# 📖 Safepay Documentation

For the latest official Safepay integration instructions, always refer to Safepay's documentation rather than relying exclusively on this repository.

The current Safepay Express Checkout documentation covers payment sessions, authentication tokens, Checkout URLs, redirects, payment status, webhooks, and order management.

The current Safepay Node integration documentation uses:

```bash
npm install --save @sfpy/node-core
```

and documents Node.js 18+ as a requirement.

---

# ⭐ Final Result

At the end of this project we successfully achieved:

```text
Next.js
   ↓
Safepay Sandbox
   ↓
Successful Payment
   ↓
Safepay Dashboard
   ↓
payment.succeeded
   ↓
Public Webhook
   ↓
ngrok
   ↓
Next.js API Route
   ↓
HMAC Signature Verification
   ↓
HTTP 200
```

**Sandbox payment integration: ✅ WORKING**
