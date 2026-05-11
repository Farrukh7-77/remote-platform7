// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "job_seeker" | "employer";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  companyName?: string;
  companyWebsite?: string;
  companyLogo?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: UserRole, companyName?: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, name: string, role: UserRole, companyName?: string) => {
    if (!email || !password || !name) {
      return { success: false, error: "All fields are required" };
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    const users = JSON.parse(localStorage.getItem("auth_users") || "[]");
    if (users.find((u: any) => u.email === email)) {
      return { success: false, error: "User already exists" };
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      role,
      avatar: "",
      ...(role === "employer" && { companyName: companyName || name }),
    };
    users.push(newUser);
    localStorage.setItem("auth_users", JSON.stringify(users));

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

  const updateUser = async (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("auth_user", JSON.stringify(updatedUser));

      const users = JSON.parse(localStorage.getItem("auth_users") || "[]");
      const index = users.findIndex((u: any) => u.email === user.email);
      if (index !== -1) {
        users[index] = { ...users[index], ...data };
        localStorage.setItem("auth_users", JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateUser }}>
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