"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type UserRole = "jobseeker" | "employer";

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
  voen?: string; // YENİ: VÖEN
  verification_status?: string; // YENİ: pending, approved, rejected
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole, 
    companyName?: string,
    voen?: string  // YENİ: VÖEN parametri
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  showAuthModal: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 dəqiqə

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Load user from localStorage on page load/refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    const storedToken = localStorage.getItem("auth_token");
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
      }
    }
    setLoading(false);
  }, []);

  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);

  // YENİ: signUp funksiyası - voen parametri əlavə edildi
  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole, 
    companyName?: string,
    voen?: string
  ) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role, companyName, voen }),
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

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  }, []);

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
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        localStorage.setItem("auth_user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // SESSION TIMEOUT
  useEffect(() => {
    if (!user) return;
    
    let timeoutId: NodeJS.Timeout;
    
    const startTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        signOut();
        alert("Session expired. Please sign in again.");
      }, SESSION_TIMEOUT);
    };
    
    startTimeout();
    
    const resetTimeout = () => {
      startTimeout();
    };
    
    window.addEventListener("click", resetTimeout);
    window.addEventListener("keypress", resetTimeout);
    window.addEventListener("scroll", resetTimeout);
    window.addEventListener("mousemove", resetTimeout);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("click", resetTimeout);
      window.removeEventListener("keypress", resetTimeout);
      window.removeEventListener("scroll", resetTimeout);
      window.removeEventListener("mousemove", resetTimeout);
    };
  }, [user, signOut]);

  return (
    <AuthContext.Provider value={{ 
      user, loading, signUp, signIn, signOut, updateUser,
      openAuthModal, closeAuthModal, showAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}