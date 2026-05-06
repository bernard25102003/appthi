import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import api, { getToken, setToken, removeToken } from "../../lib/api/client";
import { API } from "../../lib/api/endpoints";
import type { ApiUser, AuthResponse } from "../../lib/api/types";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  phone: string | null;
  avatarUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toUser(u: ApiUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    avatarUrl: u.avatarUrl,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, restore session if token exists
  useEffect(() => {
    const restore = async () => {
      if (!getToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.get<ApiUser>(API.AUTH.ME);
        setUser(toUser(data));
      } catch {
        removeToken();
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<AuthResponse>(API.AUTH.LOGIN, { email, password }, { skipAuth: true });
    setToken(data.accessToken);
    setUser(toUser(data.user));
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.post<AuthResponse>(API.AUTH.REGISTER, { name, email, password }, { skipAuth: true });
    setToken(data.accessToken);
    setUser(toUser(data.user));
  };

  const logout = async () => {
    try {
      await api.post(API.AUTH.LOGOUT);
    } catch {
      // ignore errors on logout
    } finally {
      removeToken();
      setUser(null);
    }
  };

  const isAdmin = useMemo(() => user?.role === "ADMIN", [user?.role]);
  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAdmin,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
