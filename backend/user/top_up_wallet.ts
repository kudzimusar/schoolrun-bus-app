import { api, APIError } from "encore.dev/api";
import { userDB } from "./db";

export interface TopUpWalletRequest {
  userId: number;
  amount: number;
  currency: "usd" | "zwl";
}

export interface TopUpWalletResponse {
  userId: number;
  walletBalanceUsd: number;
  walletBalanceZwl: number;
}

// Tops up a user's digital wallet.
export const topUpWallet = api<TopUpWalletRequest, TopUpWalletResponse>(
  { expose: true, method: "POST", path: "/users/wallet/topup" },
  async (req) => {
    if (req.amount <= 0) {
      throw APIError.invalidArgument("Top-up amount must be positive");
    }

    let query;
    if (req.currency === 'usd') {
      query = `
        UPDATE users 
        SET wallet_balance_usd = wallet_balance_usd + ${req.amount} 
        WHERE id = ${req.userId}
      `;
    } else {
      query = `
        UPDATE users 
        SET wallet_balance_zwl = wallet_balance_zwl + ${req.amount} 
        WHERE id = ${req.userId}
      `;
    }
    
    await userDB.exec(query);

    const updatedUser = await userDB.queryRow<{
      wallet_balance_usd: number;
      wallet_balance_zwl: number;
    }>`
      SELECT wallet_balance_usd, wallet_balance_zwl
      FROM users
      WHERE id = ${req.userId}
    `;

    if (!updatedUser) {
      throw APIError.notFound("user not found");
    }

    return {
      userId: req.userId,
      walletBalanceUsd: updatedUser.wallet_balance_usd,
      walletBalanceZwl: updatedUser.wallet_balance_zwl,
    };
  }
);
