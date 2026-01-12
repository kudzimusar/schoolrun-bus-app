import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import crypto from "crypto";

export const paymentsDB = new SQLDatabase("payments", {
  migrations: "./migrations",
});

const PaynowIntegrationID = secret("PaynowIntegrationID");
const PaynowIntegrationKey = secret("PaynowIntegrationKey");

interface PaynowInitiateRequest {
  userId: number;
  amount: number;
  currency: "USD" | "ZWL";
  email: string;
}

interface PaynowInitiateResponse {
  transactionId: number;
  pollUrl: string;
  browserUrl: string;
}

// Helper to generate Paynow signature
function generateSignature(data: Record<string, string>, key: string): string {
  const sortedValues = Object.keys(data)
    .sort()
    .map(k => data[k])
    .join("");
  return crypto.createHash("sha512").update(sortedValues + key).digest("hex").toUpperCase();
}

// Initiates a payment with Paynow
export const initiatePaynow = api<PaynowInitiateRequest, PaynowInitiateResponse>(
  { expose: true, method: "POST", path: "/payments/paynow/initiate" },
  async (req) => {
    const reference = `BUS-${req.userId}-${Date.now()}`;
    const paynowData: Record<string, string> = {
      resulturl: "https://kudzimusar.github.io/schoolrun-bus-app/payment-success",
      returnurl: "https://kudzimusar.github.io/schoolrun-bus-app/payment-success",
      reference: reference,
      amount: req.amount.toString(),
      id: PaynowIntegrationID(),
      additionalinfo: `Bus Subscription for User ${req.userId}`,
      authemail: req.email,
      status: "Message",
    };

    const signature = generateSignature(paynowData, PaynowIntegrationKey());
    paynowData["hash"] = signature;

    // In a real environment, we would use fetch to call Paynow
    // For this implementation, we'll simulate the Paynow response
    // and log the transaction to our database.
    
    const row = await paymentsDB.queryRow<{ id: number }>`
      INSERT INTO transactions (user_id, amount, currency, status, paynow_reference)
      VALUES (${req.userId}, ${req.amount}, ${req.currency}, 'initiated', ${reference})
      RETURNING id
    `;

    if (!row) throw new APIError(500, "failed to log transaction");

    // Simulated Paynow response
    return {
      transactionId: row.id,
      pollUrl: `https://www.paynow.co.zw/Interface/CheckPayment/?guid=simulated-${row.id}`,
      browserUrl: `https://www.paynow.co.zw/Payment/ConfirmPayment/simulated-${row.id}`,
    };
  }
);

export const checkPaymentStatus = api<{ transactionId: number }, { status: string }>(
  { expose: true, method: "GET", path: "/payments/paynow/status/:transactionId" },
  async ({ transactionId }) => {
    const row = await paymentsDB.queryRow<{ status: string }>`
      SELECT status FROM transactions WHERE id = ${transactionId}
    `;
    if (!row) throw new APIError(404, "transaction not found");
    return { status: row.status };
  }
);
