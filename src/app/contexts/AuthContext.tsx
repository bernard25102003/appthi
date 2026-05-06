import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  clearSession,
  getSession,
  loginUser,
  registerUser,
  type PublicUser,
} from "../utils/authStorage";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = getSession();
    if (session?.user) setUser(session.user);
  }, []);

  const login = async (email: string, password: string) => {
    const session = await loginUser({ email, password });
    setUser(session.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const newUser = await registerUser({ name, email, password });
    // Auto-login sau khi đăng ký
    setUser(newUser);
    // tạo session bằng login để có token nhất quán
    await login(email, password);
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const isAdmin = useMemo(() => user?.role === "admin", [user?.role]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAdmin,
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
