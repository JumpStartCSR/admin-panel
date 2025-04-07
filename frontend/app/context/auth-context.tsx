"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  PCG_status?: string;
  token: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const login = async (userData: User) => {
    try {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/signin");
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const isPublicRoute = pathname === "/signin";

    if (stored) {
      try {
        const parsed: User = JSON.parse(stored);
        setUser(parsed);

        if (isPublicRoute) {
          router.push("/");
        }
      } catch {
        localStorage.removeItem("user");
      }
    } else if (!isPublicRoute) {
      router.push("/signin");
    }
  }, [pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
