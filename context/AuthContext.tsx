// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing user
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    // Simple validation
    if (!email || !password || !name) {
      return { success: false, error: "All fields are required" };
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem("auth_users") || "[]");
    if (users.find((u: any) => u.email === email)) {
      return { success: false, error: "User already exists" };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password, // In production, this should be hashed!
      name,
    };
    users.push(newUser);
    localStorage.setItem("auth_users", JSON.stringify(users));

    // Auto-login after signup
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem("auth_user", JSON.stringify(userWithoutPassword));

    return { success: true };
  };

  const signIn = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("auth_users") || "[]");
    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (!foundUser) {
      return { success: false, error: "Invalid email or password" };
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem("auth_user", JSON.stringify(userWithoutPassword));

    return { success: true };
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
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