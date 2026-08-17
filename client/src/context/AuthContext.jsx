import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("careerai_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("careerai_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.data.user);
        localStorage.setItem("careerai_user", JSON.stringify(res.data.data.user));
      })
      .catch(() => {
        localStorage.removeItem("careerai_token");
        localStorage.removeItem("careerai_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data.data;
    localStorage.setItem("careerai_token", token);
    localStorage.setItem("careerai_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const signup = async (payload) => {
    const res = await api.post("/auth/signup", payload);
    const { token, user } = res.data.data;
    localStorage.setItem("careerai_token", token);
    localStorage.setItem("careerai_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("careerai_token");
    localStorage.removeItem("careerai_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
