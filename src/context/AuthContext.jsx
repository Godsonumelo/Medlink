import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { authService } from "../services/auth";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setTokens = useCallback((data, remember) => {
    const store = remember ? localStorage : sessionStorage;
    store.setItem("medlink_token", data.token);
    if (data.refreshToken) {
      store.setItem("medlink_refresh_token", data.refreshToken);
    }
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem("medlink_token");
    localStorage.removeItem("medlink_refresh_token");
    sessionStorage.removeItem("medlink_token");
    sessionStorage.removeItem("medlink_refresh_token");
  }, []);

  const readToken = useCallback(
    () =>
      localStorage.getItem("medlink_token") || sessionStorage.getItem("medlink_token"),
    []
  );

  const checkAuth = useCallback(async () => {
    const token = readToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const profile = await authService.getProfile();
      setUser(profile.user || profile);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [readToken, clearTokens]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (credentials, rememberMe = true) => {
    const data = await authService.login(credentials);
    setTokens(data, rememberMe);
    setUser(data.user);
    return data;
  }, [setTokens]);

  const register = useCallback(async (data, rememberMe = true) => {
    const response = await authService.register(data);
    setTokens(response, rememberMe);
    setUser(response.user);
    return response;
  }, [setTokens]);

  const socialAuth = useCallback(async (provider, token, rememberMe = true) => {
    const fn = provider === "google" ? authService.googleAuth : authService.appleAuth;
    const response = await fn(token);
    setTokens(response, rememberMe);
    setUser(response.user);
    return response;
  }, [setTokens]);

  const updateProfile = useCallback(async (data) => {
    const response = await authService.updateProfile(data);
    setUser(response.user || response);
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearTokens();
      setUser(null);
    }
  }, [clearTokens]);

  const hasRole = useCallback(
    (roles) => {
      if (!user) return false;
      if (typeof roles === "string") return user.role === roles;
      return roles.includes(user.role);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      socialAuth,
      updateProfile,
      logout,
      checkAuth,
      hasRole,
    }),
    [user, loading, login, register, socialAuth, updateProfile, logout, checkAuth, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
