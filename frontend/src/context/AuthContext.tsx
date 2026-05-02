import { createContext } from "react";

import type { RoleCode, User } from "../services/auth";

export type AuthContextValue = {
  loading: boolean;
  user: User | null;
  role: RoleCode | null;
  isAuthenticated: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
