import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { mockUser } from '../mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone: string; address: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Mock login
    await new Promise(resolve => setTimeout(resolve, 500));
    if (email && password) {
      setUser(mockUser);
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone: string; address: string }) => {
    // Mock register
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      role: 'user',
      status: 'active',
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
