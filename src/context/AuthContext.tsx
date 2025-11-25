"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthLoginResponse, User } from "@//types/user";
import { tokenUtils } from "@/lib/tokenUtils";
import { authApi } from "@/lib/authApi";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: AuthLoginResponse) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = tokenUtils.getAccessToken();
    const savedUser = localStorage.getItem("user");

    if (token) {
      setIsAuthenticated(true);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setIsLoading(false);
  }, []);

  const login = (response: AuthLoginResponse) => {
    tokenUtils.setTokens(response);

    const { user } = response.data;
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    const refreshToken = tokenUtils.getRefreshToken();

    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (error) {
        console.error("Logout API failed (ignoring):", error);
      }
    }

    tokenUtils.clearTokens();

    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  const refreshUser = async () => {
    try {
      const token = tokenUtils.getAccessToken();
      if (!token) return;

      const res = await authApi.getMe();
      if (res.data && res.data.data) {
        setUser(res.data.data);
        localStorage.setItem("user", JSON.stringify(res.data.data));
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
