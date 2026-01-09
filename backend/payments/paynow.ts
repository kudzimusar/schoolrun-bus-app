import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { paymentsDB } from "./ecocash"; // Reuse the same DB for now
import { topUpWallet } from "../user/top_up_wallet";

const PaynowIntegrationID = secret("PaynowIntegrationID");
const PaynowIntegrationKey = secret("PaynowIntegrationKey");

interface PaynowInitiateRequest {
  userId: number;
  amount: number;
  currency: "USD" | "ZWL";
  email: string;
  authemail?: string;
}

export const initiatePaynow = api<PaynowInitiateRequest, { pollUrl: string; browserUrl: string }>(
  { expose: true, method: "POST", path: "/payments/paynow/initiate" },
  async (req) => {
    // Implementation will go here in the next phase
    return { pollUrl: "", browserUrl: "" };
  }
);
