import { api, APIError } from "encore.dev/api";
import { authDB } from "./db";
import { userDB } from "../user/db";

export interface VerifySessionRequest {
  sessionToken: string;
}

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

// Verifies a session token and returns user information.
export const verifySession = api<VerifySessionRequest, SessionUser>(
  { expose: true, method: "POST", path: "/auth/verify" },
  async (req) => {
    // Check if session exists and is valid
    const session = await authDB.queryRow<{
      userId: number;
      expiresAt: Date;
    }>`
      SELECT user_id as "userId", expires_at as "expiresAt"
      FROM user_sessions 
      WHERE session_token = ${req.sessionToken} 
        AND expires_at > NOW()
    `;
    
    if (!session) {
      throw APIError.unauthenticated("Invalid or expired session");
    }
    
    // Get user details
    const user = await userDB.queryRow<{
      id: number;
      email: string;
      name: string;
      role: string;
    }>`
      SELECT id, email, name, role
      FROM users 
      WHERE id = ${session.userId}
    `;
    
    if (!user) {
      throw APIError.unauthenticated("User not found");
    }
    
    // Get user permissions
    const permissions: string[] = [];
    for await (const perm of authDB.query<{ resource: string; action: string }>`
      SELECT resource, action
      FROM role_permissions 
      WHERE role = ${user.role}
    `) {
      permissions.push(`${perm.resource}:${perm.action}`);
    }
    
    // Update last accessed time
    await authDB.exec`
      UPDATE user_sessions 
      SET last_accessed = NOW() 
      WHERE session_token = ${req.sessionToken}
    `;
    
    return {
      ...user,
      permissions,
    };
  }
);
