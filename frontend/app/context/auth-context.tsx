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
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const login = async (userData: User) => {
    const today = new Date().toISOString().split("T")[0];
    sessionStorage.setItem("sessionStart", Date.now().toString());

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    try {
      await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pb_user_id: userData.id,
          date: today,
          timeused: 0,
          login: true,
        }),
      });
    } catch (err) {
      console.error("Failed to log login activity", err);
    }
  };

  const logout = async () => {
    const start = sessionStorage.getItem("sessionStart");
    const sessionStart = start ? parseInt(start) : null;

    if (user && sessionStart) {
      const sessionTime = Math.floor((Date.now() - sessionStart) / 1000);
      const today = new Date().toISOString().split("T")[0];

      try {
        await fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pb_user_id: user.id,
            date: today,
            timeused: sessionTime,
            login: false,
          }),
          keepalive: true,
        });
      } catch (err) {
        console.error("Failed to log logout activity", err);
      }
    }

    // Clear storage and user
    setUser(null);
    localStorage.removeItem("user");
    sessionStorage.removeItem("sessionStart");
    router.push("/signin");
  };

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/get-user-role");
      if (!res.ok) throw new Error("Failed to refresh user");
      const data = await res.json();
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (err) {
      console.error("Failed to refresh user:", err);
      await logout(); // fallback
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const isPublicRoute = pathname === "/signin";

    if (stored) {
      try {
        const parsed: User = JSON.parse(stored);
        setUser(parsed);

        if (!sessionStorage.getItem("sessionStart")) {
          sessionStorage.setItem("sessionStart", Date.now().toString());
        }

        if (isPublicRoute) {
          router.push("/");
        }
      } catch {
        localStorage.removeItem("user");
      }
    } else if (!isPublicRoute) {
      router.push("/signin");
    }
  }, [pathname]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        refreshUser,
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
