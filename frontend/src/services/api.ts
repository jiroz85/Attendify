import axios, { AxiosError } from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

export type RefreshFn = (
  refreshToken: string,
) => Promise<{ accessToken: string; refreshToken: string }>;
export type GetRefreshTokenFn = () => string | null;
export type SetTokensFn = (
  tokens: { accessToken: string; refreshToken: string } | null,
) => void;

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<{
  accessToken: string;
  refreshToken: string;
}> | null = null;
let doRefresh: RefreshFn | null = null;
let getRefreshToken: GetRefreshTokenFn | null = null;
let setTokens: SetTokensFn | null = null;

export function configureAuthInterceptors(deps: {
  refresh: RefreshFn;
  getRefreshToken: GetRefreshTokenFn;
  setTokens: SetTokensFn;
}) {
  doRefresh = deps.refresh;
  getRefreshToken = deps.getRefreshToken;
  setTokens = deps.setTokens;
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAccessTokenForApi(accessToken: string | null) {
  if (accessToken) {
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as RetryConfig | undefined;

    if (!original || status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (!doRefresh || !getRefreshToken || !setTokens) {
      return Promise.reject(error);
    }

    const rt = getRefreshToken();
    if (!rt) {
      setTokens(null);
      setAccessTokenForApi(null);
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      refreshPromise ||= doRefresh(rt);
      const tokens = await refreshPromise;
      setTokens(tokens);
      setAccessTokenForApi(tokens.accessToken);

      const cfg: AxiosRequestConfig = {
        ...original,
        headers: {
          ...(original.headers || {}),
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      };

      return api.request(cfg);
    } catch (e) {
      setTokens(null);
      setAccessTokenForApi(null);
      return Promise.reject(e);
    } finally {
      refreshPromise = null;
    }
  },
);
