import { api, APIError } from "encore.dev/api";
import { authDB } from "./db";
import { userDB } from "../user/db";
import crypto from "crypto";
import bcrypt from "bcrypt";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
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

// Authenticates a user and creates a session.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    // Get user by email
    const user = await userDB.queryRow<{
      id: number;
      email: string;
      name: string;
      role: string;
      password_hash: string;
      wallet_balance_usd: number;
      wallet_balance_zwl: number;
    }>`
      SELECT id, email, name, role, password_hash,
             COALESCE(wallet_balance_usd, 0) as wallet_balance_usd, 
             COALESCE(wallet_balance_zwl, 0) as wallet_balance_zwl
      FROM users 
      WHERE email = ${req.email}
    `;
    
    if (!user) {
      throw APIError.unauthenticated("Invalid credentials");
    }
    
    // Verify the password hash
    const passwordMatch = await bcrypt.compare(req.password, user.password_hash);
    if (!passwordMatch) {
      throw APIError.unauthenticated("Invalid credentials");
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
