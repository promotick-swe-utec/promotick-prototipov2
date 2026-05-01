"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export type Role = "admin" | "usuario";

interface User {
  username: string;
  fullName: string;
  role: Role;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => string | null;
  logout: () => void;
}

const MOCK_ACCOUNTS: Record<string, { password: string; fullName: string; role: Role }> = {
  "admin@admin.com": { password: "admin", fullName: "Administrador Sistema", role: "admin" },
  "user@user.com": { password: "user", fullName: "Ana García López", role: "usuario" },
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: () => null,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("promotick_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("promotick_user");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((username: string, password: string): string | null => {
    const account = MOCK_ACCOUNTS[username];
    if (!account || account.password !== password) {
      return "Correo y/o contraseña incorrectos";
    }
    const u: User = { username, fullName: account.fullName, role: account.role };
    setUser(u);
    localStorage.setItem("promotick_user", JSON.stringify(u));
    return null;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("promotick_user");
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
