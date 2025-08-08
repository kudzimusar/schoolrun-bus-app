import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import log from "encore.dev/log";
import { topUpWallet } from "../user/top_up_wallet";

interface InitiateRequest {
  userId: number;
  amount: number;
  currency: "usd" | "zwl";
  msisdn: string; // EcoCash mobile number in E.164 format
}

interface InitiateResponse {
  provider: "ecocash";
  providerRef: string;
  status: "pending" | "confirmed" | "failed";
}

interface StatusResponse extends InitiateResponse {}

const EcoCashAPIKey = secret("EcoCashAPIKey");
const EcoCashShortCode = secret("EcoCashShortCode");
const EcoCashBaseURL = secret("EcoCashBaseURL");

export const paymentsDB = new SQLDatabase("payments", {
  migrations: "./migrations",
});

export const initiate = api<InitiateRequest, InitiateResponse>(
  { expose: true, method: "POST", path: "/payments/ecocash/initiate" },
  async (req) => {
    if (req.amount <= 0) {
      throw APIError.invalidArgument("amount must be greater than 0");
    }

    // Create a pending transaction row first
    const txRow = await paymentsDB.queryRow<{
      id: number;
      provider_ref: string | null;
    }>`
      INSERT INTO transactions (user_id, amount, currency, msisdn, raw_request)
      VALUES (${req.userId}, ${req.amount}, ${req.currency}, ${req.msisdn}, ${JSON.stringify(req)})
      RETURNING id, provider_ref
    `;

    if (!txRow) {
      throw new Error("failed to create transaction");
    }

    const providerRef = `ECO-${txRow.id}-${Date.now()}`;

    // Simulate EcoCash API call in local dev if secrets are missing
    const apiKey = EcoCashAPIKey();
    const shortCode = EcoCashShortCode();
    const baseURL = EcoCashBaseURL();

    let confirmed = false;
    let rawResponse: unknown = { simulated: true };

    if (apiKey && shortCode && baseURL) {
      try {
        const resp = await fetch(`${baseURL}/payments/initiate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": apiKey,
            "X-Short-Code": shortCode,
          },
          body: JSON.stringify({
            msisdn: req.msisdn,
            amount: req.amount,
            currency: req.currency,
            reference: providerRef,
          }),
        });
        rawResponse = await resp.json().catch(() => ({}));
        confirmed = resp.ok;
      } catch (err) {
        log.error("EcoCash initiate error", { err: String(err) });
      }
    } else {
      // No secrets => simulate a pending payment locally
      confirmed = false;
    }

    await paymentsDB.exec`
      UPDATE transactions
      SET provider_ref = ${providerRef}, status = ${confirmed ? "confirmed" : "pending"}, raw_response = ${JSON.stringify(rawResponse)}, updated_at = NOW()
      WHERE id = ${txRow.id}
    `;

    // If immediately confirmed (e.g., sandbox), credit wallet
    if (confirmed) {
      await topUpWallet({ userId: req.userId, amount: req.amount, currency: req.currency });
    }

    return { provider: "ecocash", providerRef, status: confirmed ? "confirmed" : "pending" };
  }
);

export const status = api<{ providerRef: string }, StatusResponse>(
  { expose: true, method: "GET", path: "/payments/ecocash/status/:providerRef" },
  async ({ providerRef }) => {
    const row = await paymentsDB.queryRow<{
      id: number;
      user_id: number;
      amount: number;
      currency: "usd" | "zwl";
      status: string;
    }>`
      SELECT id, user_id, amount, currency, status
      FROM transactions
      WHERE provider_ref = ${providerRef}
    `;

    if (!row) throw APIError.notFound("transaction not found");

    // Optionally poll real provider here if still pending
    return { provider: "ecocash", providerRef, status: row.status as InitiateResponse["status"] };
  }
);

// Webhook endpoint for EcoCash to notify payment updates
export const webhook = api<{
  reference: string;
  status: "confirmed" | "failed";
}, { ok: true }>(
  { expose: true, method: "POST", path: "/payments/ecocash/webhook" },
  async (payload) => {
    const tx = await paymentsDB.queryRow<{
      id: number;
      user_id: number;
      amount: number;
      currency: "usd" | "zwl";
      status: string;
    }>`
      SELECT id, user_id, amount, currency, status
      FROM transactions
      WHERE provider_ref = ${payload.reference}
    `;

    if (!tx) throw APIError.notFound("transaction not found");

    if (tx.status === payload.status) {
      return { ok: true };
    }

    await paymentsDB.exec`
      UPDATE transactions SET status = ${payload.status}, updated_at = NOW() WHERE id = ${tx.id}
    `;

    if (payload.status === "confirmed") {
      await topUpWallet({ userId: tx.user_id, amount: tx.amount, currency: tx.currency });
    }

    return { ok: true };
  }
);