import { api, APIError } from "encore.dev/api";
import { userDB } from "./db";

export interface UpdateUserRequest {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  phone?: string;
  walletBalanceUsd: number;
  walletBalanceZwl: number;
  createdAt: Date;
  updatedAt: Date;
}

// Updates user profile information.
export const updateUser = api<UpdateUserRequest, User>(
  { expose: true, method: "PUT", path: "/users/:id" },
  async (req) => {
    const user = await userDB.queryRow<User>`
      UPDATE users 
      SET 
        name = COALESCE(${req.name}, name),
        email = COALESCE(${req.email}, email),
        phone = COALESCE(${req.phone}, phone),
        updated_at = NOW()
      WHERE id = ${req.id}
      RETURNING id, email, name, role, phone, 
                wallet_balance_usd as "walletBalanceUsd", 
                wallet_balance_zwl as "walletBalanceZwl",
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    if (!user) {
      throw APIError.notFound("user not found");
    }
    
    return user;
  }
);
