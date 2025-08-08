import { api } from "encore.dev/api";
import { authDB } from "./db";
import { userDB } from "../user/db";
import crypto from "crypto";

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
    }>`
      SELECT id, email, name, role
      FROM users 
      WHERE email = ${req.email}
    `;
    
    if (!user) {
      throw new Error("Invalid credentials");
    }
    
    // In a real implementation, you would verify the password hash
    // For demo purposes, we accept any password
    
    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Create session
    await authDB.exec`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (${user.id}, ${sessionToken}, ${expiresAt})
    `;
    
    return {
      user,
      sessionToken,
      expiresAt,
    };
  }
);
