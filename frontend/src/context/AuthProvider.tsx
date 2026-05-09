import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthContext } from "./AuthContext";
import type { RoleCode, User } from "../services/auth";
import { login as loginApi, refreshTokens } from "../services/auth";
import { me as meApi } from "../services/user";
import {
  configureAuthInterceptors,
  setAccessTokenForApi,
} from "../services/api";

type Tokens = { accessToken: string; refreshToken: string };

type AuthState = {
  loading: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
};

const STORAGE_KEY = "attendfy.tokens";
const TAB_ID_KEY = "attendfy.tabId";
const TAB_LOCK_KEY = "attendfy.tabLock";

type TabLock = { tabId: string; ts: number };

function getTabId(): string {
  try {
    const existing = sessionStorage.getItem(TAB_ID_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(TAB_ID_KEY, id);
    return id;
  } catch {
    return String(Math.random()).slice(2);
  }
}

function readTabLock(): TabLock | null {
  try {
    const raw = localStorage.getItem(TAB_LOCK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TabLock>;
    if (!parsed.tabId || typeof parsed.ts !== "number") return null;
    return { tabId: parsed.tabId, ts: parsed.ts };
  } catch {
    return null;
  }
}

function writeTabLock(lock: TabLock | null) {
  try {
    if (!lock) {
      localStorage.removeItem(TAB_LOCK_KEY);
      return;
    }
    localStorage.setItem(TAB_LOCK_KEY, JSON.stringify(lock));
  } catch {
    return;
  }
}

function readStoredTokens(): Tokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Tokens>;
    if (!parsed.accessToken || !parsed.refreshToken) return null;
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
    };
  } catch {
    return null;
  }
}

function writeStoredTokens(tokens: Tokens | null) {
  try {
    if (!tokens) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const tabId = useMemo(() => getTabId(), []);
  const [state, setState] = useState<AuthState>(() => {
    const stored = readStoredTokens();
    return {
      loading: true,
      user: null,
      accessToken: stored?.accessToken ?? null,
      refreshToken: stored?.refreshToken ?? null,
    };
  });

  const setTokens = useCallback((tokens: Tokens | null) => {
    writeStoredTokens(tokens);
    setState((s) => ({
      ...s,
      accessToken: tokens?.accessToken ?? null,
      refreshToken: tokens?.refreshToken ?? null,
    }));
  }, []);

  const logout = useCallback(() => {
    setTokens(null);
    setAccessTokenForApi(null);
    setState((s) => ({ ...s, user: null }));
    const lock = readTabLock();
    if (lock && lock.tabId === tabId) {
      writeTabLock(null);
    }
  }, [setTokens, tabId]);

  const claimTabLock = useCallback(() => {
    writeTabLock({ tabId, ts: Date.now() });
  }, [tabId]);

  const refresh = useCallback(async () => {
    const rt = state.refreshToken;
    if (!rt) {
      logout();
      return;
    }

    const tokens = await refreshTokens({ refreshToken: rt });
    setTokens(tokens);
    setAccessTokenForApi(tokens.accessToken);
  }, [logout, setTokens, state.refreshToken]);

  const login = useCallback(
    async (params: { email: string; password: string }) => {
      const res = await loginApi(params);
      setTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });
      setAccessTokenForApi(res.accessToken);
      setState((s) => ({ ...s, user: res.user }));
      claimTabLock();
    },
    [claimTabLock, setTokens],
  );

  useEffect(() => {
    const hasTokens = !!state.accessToken && !!state.refreshToken;
    if (hasTokens) {
      claimTabLock();
    }
  }, [claimTabLock, state.accessToken, state.refreshToken]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== TAB_LOCK_KEY) return;
      if (!state.accessToken || !state.refreshToken) return;
      const lock = readTabLock();
      if (lock && lock.tabId !== tabId) {
        logout();
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [logout, state.accessToken, state.refreshToken, tabId]);

  useEffect(() => {
    configureAuthInterceptors({
      refresh: async (refreshToken) => refreshTokens({ refreshToken }),
      getRefreshToken: () => state.refreshToken,
      setTokens: (tokens) => setTokens(tokens),
    });
  }, [setTokens, state.refreshToken]);

  useEffect(() => {
    setAccessTokenForApi(state.accessToken);
  }, [state.accessToken]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        if (!state.accessToken) {
          if (!cancelled) setState((s) => ({ ...s, loading: false }));
          return;
        }

        try {
          const user = await meApi();
          if (!cancelled) setState((s) => ({ ...s, user, loading: false }));
          return;
        } catch {
          // fallthrough -> try refresh
        }

        if (!state.refreshToken) {
          logout();
          if (!cancelled) setState((s) => ({ ...s, loading: false }));
          return;
        }

        await refresh();
        const user = await meApi();
        if (!cancelled) setState((s) => ({ ...s, user, loading: false }));
      } catch {
        logout();
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [logout, refresh, state.accessToken, state.refreshToken]);

  const value = useMemo(() => {
    const role: RoleCode | null = state.user?.role ?? null;

    return {
      loading: state.loading,
      user: state.user,
      role,
      isAuthenticated: !!state.user,
      login,
      logout,
      refresh,
    };
  }, [login, logout, refresh, state.loading, state.user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
