"use client"

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/interfaces/user";
import { UserCredentials } from "@/interfaces/user-credentials";
import { LoginResponse } from "@/interfaces/auth";
import { AuthContextType } from "@/interfaces/auth-context";
import { jwtDecode } from "jwt-decode";
import { useDate } from "./date-context";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { resetDates } = useDate();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("currentUser");

    if (token && userData) {
      try {
        const decoded: { exp?: number } = jwtDecode(token);
        const now = Date.now() / 1000;

        if (!decoded.exp || decoded.exp < now) {
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");
          router.push("/login");
          return;
        }

        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
    setIsLoading(false);
  }, []);

  const login = async (userCredentials: UserCredentials): Promise<boolean> => {
    try {
      const { username, password } = userCredentials;
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Credenciales inválidas")
      }

      const data: LoginResponse = await res.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      setUser(data.user);
      resetDates();
      return true;
    } catch (error) {
      return false;
    }
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setUser(null);
    router.push("/login");
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
