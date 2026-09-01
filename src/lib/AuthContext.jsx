import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '@/api/authClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try { setUser((await authApi.me()).user); }
    catch { setUser(null); }
    finally { setIsLoadingAuth(false); }
  }, []);

  useEffect(() => { checkUserAuth(); }, [checkUserAuth]);

  const login = async (email, password) => {
    const result = await authApi.login(email, password);
    setUser(result.user);
    return result.user;
  };
  const register = async (email, password, displayName) => {
    const result = await authApi.register(email, password, displayName);
    setUser(result.user);
    return result.user;
  };
  const logout = async () => {
    try { await authApi.logout(); } finally { setUser(null); }
  };

  return <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoadingAuth, login, register, logout, checkUserAuth }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
