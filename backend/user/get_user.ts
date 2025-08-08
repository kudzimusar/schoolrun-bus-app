import { api, APIError } from "encore.dev/api";
import { userDB } from "./db";

export interface GetUserParams {
  id: number;
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

// Retrieves a user by their ID.
export const getUser = api<GetUserParams, User>(
  { expose: true, auth: true, method: "GET", path: "/users/:id" },
  async (params) => {
    const user = await userDB.queryRow<User>`
      SELECT id, email, name, role, phone, 
             wallet_balance_usd as "walletBalanceUsd", 
             wallet_balance_zwl as "walletBalanceZwl",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users 
      WHERE id = ${params.id}
    `;
    
    if (!user) {
      throw APIError.notFound("user not found");
    }
    
    return user;
  }
);
