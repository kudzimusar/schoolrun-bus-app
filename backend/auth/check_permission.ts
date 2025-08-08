import { api, APIError } from "encore.dev/api";
import { authDB } from "./db";

export interface CheckPermissionRequest {
  sessionToken: string;
  resource: string;
  action: string;
}

export interface PermissionResponse {
  allowed: boolean;
  userRole: string;
}

// Checks if a user has permission to perform an action on a resource.
export const checkPermission = api<CheckPermissionRequest, PermissionResponse>(
  { expose: true, method: "POST", path: "/auth/check-permission" },
  async (req) => {
    // Get user role from session
    const session = await authDB.queryRow<{ userId: number }>`
      SELECT user_id as "userId"
      FROM user_sessions 
      WHERE session_token = ${req.sessionToken} 
        AND expires_at > NOW()
    `;
    
    if (!session) {
      throw APIError.unauthenticated("Invalid or expired session");
    }
    
    const user = await authDB.queryRow<{ role: string }>`
      SELECT u.role
      FROM users u
      WHERE u.id = ${session.userId}
    `;
    
    if (!user) {
      throw APIError.unauthenticated("User not found");
    }
    
    // Check permission
    const permission = await authDB.queryRow<{ id: number }>`
      SELECT id
      FROM role_permissions 
      WHERE role = ${user.role} 
        AND resource = ${req.resource} 
        AND action = ${req.action}
    `;
    
    return {
      allowed: !!permission,
      userRole: user.role,
    };
  }
);
