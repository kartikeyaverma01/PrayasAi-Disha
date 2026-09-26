import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on first load (mock mode: localStorage; real mode: same,
  // populated from the FastAPI login/register response)
  useEffect(() => {
    const storedUser = authService.getStoredUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const loggedInUser = await authService.loginUser(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (formData) => {
    const newUser = await authService.registerUser(formData);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    authService.logoutUser();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
