import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  }, []);

  const verifyToken = useCallback(async () => {
    try {
      const response = await axios.post("/api/auth/verify", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.valid) {
        setUser(response.data.user);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        localStorage.setItem("token", token);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    token ? verifyToken() : setLoading(false);
  }, [token, verifyToken]);

  const login = async (username, password) => {
    try {
      const response = await axios.post("/api/auth/login", { username, password });

      const { token, user } = response.data;

      setToken(token);
      setUser(user);

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Login gagal",
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
