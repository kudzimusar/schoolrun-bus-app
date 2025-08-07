import { api } from "encore.dev/api";
import { userDB } from "./db";

export interface CreateUserRequest {
  email: string;
  name: string;
  role: "parent" | "driver" | "admin" | "operator";
  phone?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new user in the system.
export const createUser = api<CreateUserRequest, User>(
  { expose: true, method: "POST", path: "/users" },
  async (req) => {
    const user = await userDB.queryRow<User>`
      INSERT INTO users (email, name, role, phone)
      VALUES (${req.email}, ${req.name}, ${req.role}, ${req.phone})
      RETURNING id, email, name, role, phone, created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    if (!user) {
      throw new Error("Failed to create user");
    }
    
    return user;
  }
);
