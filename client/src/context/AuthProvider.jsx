import { useEffect, useState } from "react";
import api from "../api/axios";
import AuthContext from "./auth.context";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrateSession = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user || response.data.data?.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrateSession();
  }, []);

  const login = async ({ email, password }) => {
    const response = await api.post("/auth/login", { email, password });
    const nextUser = response.data.user || response.data.data?.user || null;
    setUser(nextUser);
    return response.data;
  };

  const register = async ({ name, email, password, role }) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    const nextUser = response.data.user || response.data.data?.user || null;
    setUser(nextUser);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refreshSession: hydrateSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
