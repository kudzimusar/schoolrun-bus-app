import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";
import backend from "~backend/client";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  sessionToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; phone?: string }) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const token = localStorage.getItem("sessionToken");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      setSessionToken(token);
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await backend.auth.login({ email, password });
      
      setUser(response.user);
      setSessionToken(response.sessionToken);
      
      // Store in localStorage for persistence
      localStorage.setItem("sessionToken", response.sessionToken);
      localStorage.setItem("user", JSON.stringify(response.user));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, role: string, phone?: string) => {
    try {
      const response = await backend.auth.signup({ 
        email, 
        password, 
        name, 
        role: role as "parent" | "driver" | "admin" | "operator",
        phone 
      });
      
      setUser(response.user);
      setSessionToken(response.sessionToken);
      
      // Store in localStorage for persistence
      localStorage.setItem("sessionToken", response.sessionToken);
      localStorage.setItem("user", JSON.stringify(response.user));
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (sessionToken) {
        await backend.auth.logout({ sessionToken });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear state and localStorage regardless of API call success
      setUser(null);
      setSessionToken(null);
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("user");
    }
  };

  const updateProfile = async (data: { name?: string; email?: string; phone?: string }) => {
    if (!user) throw new Error("No user logged in");
    
    try {
      const updatedUser = await backend.user.updateUser({
        id: user.id,
        ...data
      });
      
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      sessionToken,
      login,
      signup,
      logout,
      updateProfile,
      isLoading
    }}>
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
