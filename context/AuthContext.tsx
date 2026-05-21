// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "job_seeker" | "employer";

export type User = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  company_logo?: string;
  company_name?: string;
  company_website?: string;
  company_description?: string;
  company_location?: string;
  company_size?: string;
  company_industry?: string;
  company_linkedin?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: UserRole, companyName?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    const storedToken = localStorage.getItem("auth_token");
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, name: string, role: UserRole, companyName?: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role, companyName }),
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: "Network error" };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setLoading(false);
        return { success: false, error: data.error };
      }
      setUser(data.user);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: "Login failed" };
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  };

  // context/AuthContext.tsx - YALNIZ updateUser HİSSƏSİ
// Qalan hissə eyni qalır

const updateUser = async (updates: Partial<User>) => {
  if (!user) return;
  
  try {
    const response = await fetch("/api/auth/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, updates }),
    });
    const data = await response.json();
    
    if (response.ok && data.user) {
      // Əgər updates-də avatar varsa, onu da əlavə et
      const updatedUser = { 
        ...user, 
        ...data.user,
        avatar: updates.avatar || data.user.avatar || user.avatar
      };
      setUser(updatedUser);
      localStorage.setItem("auth_user", JSON.stringify(updatedUser));
    }
  } catch (error) {
    console.error("Update failed:", error);
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
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}