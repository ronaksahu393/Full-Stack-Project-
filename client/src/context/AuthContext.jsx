import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = api.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);

    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener("hotelpro:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("hotelpro:unauthorized", handleUnauthorized);
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const data = await api.login(email, password, rememberMe);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  const socialLogin = async (provider, token, profile) => {
    const data = await api.socialLogin(provider, token, profile);
    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  const refreshUser = async () => {
    try {
      const updated = await api.getMe();
      if (updated) {
        setUser(updated);
      }
      return updated;
    } catch (e) {
      return null;
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const isCustomer = user?.role === "customer" || (user?.role === "guest" && Boolean(user?.email));
  const isStaff = user?.role === "staff";
  const isAdmin = user?.role === "admin";
  const isStaffOrAdmin = isStaff || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
        isGuest: !user || user?.role === "guest",
        isCustomer,
        isStaff,
        isAdmin,
        isStaffOrAdmin,
        login,
        register,
        socialLogin,
        refreshUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
