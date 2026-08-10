export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ tracker?: string }>;
}) {
  const params = await searchParams;
  const tracker = params.tracker;

  if (!tracker) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl">
            !
          </div>

          <h1 className="mt-6 text-3xl font-bold text-red-600">
            Payment Verification Failed
          </h1>

          <p className="mt-3 text-gray-600">
            No transaction tracker was provided.
          </p>

          <a
            href="/checkout"
            className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-white"
          >
            Back to Checkout
          </a>
        </div>
      </main>
    );
  }

  let paymentVerified = false;
  let paymentData = null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/safepay/payment-status?tracker=${encodeURIComponent(
        tracker
      )}`,
      {
        cache: "no-store",
      }
    );

    if (response.ok) {
      paymentData = await response.json();

      // Safepay tracker state
      paymentVerified =
        paymentData?.data?.state === "TRACKER_ENDED";
    }
  } catch (error) {
    console.error("Payment verification failed:", error);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-lg">
        {paymentVerified ? (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
              ✓
            </div>

            <h1 className="mt-6 text-3xl font-bold">
              Payment Successful
            </h1>

            <p className="mt-3 text-gray-600">
              Your Safepay payment has been successfully verified.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl">
              !
            </div>

            <h1 className="mt-6 text-3xl font-bold text-red-600">
              Payment Not Verified
            </h1>

            <p className="mt-3 text-gray-600">
              We could not verify this payment with Safepay.
            </p>
          </>
        )}

        <div className="mt-6 rounded-lg bg-gray-100 p-4 text-left">
          <p className="text-sm text-gray-500">
            Transaction Tracker
          </p>

          <p className="mt-1 break-all font-mono text-sm">
            {tracker}
          </p>
        </div>

        <a
          href="/checkout"
          className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-white"
        >
          Back to Checkout
        </a>
      </div>
    </main>
  );
}