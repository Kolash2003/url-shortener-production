import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api, setToken, getToken } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  provider: "local" | "google" | "github";
  plan: "hacker" | "builder" | "scale";
  createdAt: string;
  linksCreated: number;
  totalClicks: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  completeOAuth: (token: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

function parseUser(data: { user: User }): User {
  return {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    avatar: data.user.avatar,
    bio: data.user.bio || "",
    provider: data.user.provider || "local",
    plan: data.user.plan as User["plan"],
    createdAt: data.user.createdAt,
    linksCreated: data.user.linksCreated,
    totalClicks: data.user.totalClicks,
  };
}

const STORAGE_KEY = "snipdev_auth_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      api.get<{ success: boolean; user: User }>("/auth/me")
        .then((data) => {
          const u = parseUser(data);
          setUser(u);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        })
        .catch(() => {
          setToken(null);
          localStorage.removeItem(STORAGE_KEY);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const persist = useCallback((u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ success: boolean; token: string; user: User }>("/auth/login", { email, password });
    setToken(data.token);
    persist(parseUser(data));
  };

  const signup = async (name: string, email: string, password: string) => {
    const data = await api.post<{ success: boolean; token: string; user: User }>("/auth/register", { name, email, password });
    setToken(data.token);
    persist(parseUser(data));
  };

  const completeOAuth = useCallback(async (token: string) => {
    setToken(token);
    const data = await api.get<{ success: boolean; user: User }>("/auth/me");
    persist(parseUser(data));
  }, [persist]);

  const logout = () => {
    setToken(null);
    persist(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    await api.put("/auth/profile", updates);
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.put("/auth/password", { currentPassword, newPassword });
  };

  const resetPassword = async (email: string) => {
    await api.post("/auth/forgot-password", { email });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        completeOAuth,
        logout,
        updateProfile,
        changePassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
