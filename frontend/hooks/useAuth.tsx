import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";
import backend from "~backend/client";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  walletBalanceUsd: number;
  walletBalanceZwl: number;
}

interface AuthContextType {
  user: User | null;
  sessionToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; phone?: string }) => Promise<void>;
  updateWallet: (newBalances: { walletBalanceUsd: number; walletBalanceZwl: number }) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    const userData = localStorage.getItem("user");
    if (token) setSessionToken(token);
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;
    const c = backend.with({ requestInit: { credentials: "include", headers } });
    setClient(c);
  }, [sessionToken]);

  const login = async (email: string, password: string) => {
    const c = client ?? backend;
    const response = await c.auth.login({ email, password });
    setUser(response.user);
    setSessionToken(response.sessionToken);
    localStorage.setItem("sessionToken", response.sessionToken);
    localStorage.setItem("user", JSON.stringify(response.user));
  };

  const signup = async (email: string, password: string, name: string, role: string, phone?: string) => {
    const c = client ?? backend;
    const response = await c.auth.signup({
      email,
      password,
      name,
      role: role as "parent" | "driver" | "admin" | "operator",
      phone,
    });
    setUser(response.user);
    setSessionToken(response.sessionToken);
    localStorage.setItem("sessionToken", response.sessionToken);
    localStorage.setItem("user", JSON.stringify(response.user));
  };

  const logout = async () => {
    try {
      if (sessionToken) {
        const c = client ?? backend;
        await c.auth.logout({ sessionToken });
      }
    } finally {
      setUser(null);
      setSessionToken(null);
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("user");
    }
  };

  const updateProfile = async (data: { name?: string; email?: string; phone?: string }) => {
    if (!user) throw new Error("No user logged in");
    const c = client ?? backend;
    const updatedUser = await c.user.updateUser({ id: user.id, ...data });
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const updateWallet = (newBalances: { walletBalanceUsd: number; walletBalanceZwl: number }) => {
    if (user) {
      const updatedUser = { ...user, ...newBalances };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, sessionToken, login, signup, logout, updateProfile, updateWallet, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
