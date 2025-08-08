import { api, APIError } from "encore.dev/api";
import { authDB } from "./db";
import { userDB } from "../user/db";
import crypto from "crypto";

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: "parent" | "driver" | "admin" | "operator";
  phone?: string;
}

export interface SignupResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    walletBalanceUsd: number;
    walletBalanceZwl: number;
  };
  sessionToken: string;
  expiresAt: Date;
}

// Creates a new user account and logs them in.
export const signup = api<SignupRequest, SignupResponse>(
  { expose: true, method: "POST", path: "/auth/signup" },
  async (req) => {
    // Check if user already exists
    const existingUser = await userDB.queryRow<{ id: number }>`
      SELECT id FROM users WHERE email = ${req.email}
    `;
    
    if (existingUser) {
      throw APIError.alreadyExists("User with this email already exists");
    }
    
    // Create new user
    const user = await userDB.queryRow<{
      id: number;
      email: string;
      name: string;
      role: string;
      wallet_balance_usd: number;
      wallet_balance_zwl: number;
    }>`
      INSERT INTO users (email, name, role, phone)
      VALUES (${req.email}, ${req.name}, ${req.role}, ${req.phone})
      RETURNING id, email, name, role, wallet_balance_usd, wallet_balance_zwl
    `;
    
    if (!user) {
      throw new Error("Failed to create user");
    }
    
    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Create session
    await authDB.exec`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (${user.id}, ${sessionToken}, ${expiresAt})
    `;
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletBalanceUsd: user.wallet_balance_usd,
        walletBalanceZwl: user.wallet_balance_zwl,
      },
      sessionToken,
      expiresAt,
    };
  }
);
