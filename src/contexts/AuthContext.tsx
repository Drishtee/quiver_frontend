import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  phone: string;
  fullName?: string;
  email?: string;
  tenantId: string;
  tenantName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      const accessToken = localStorage.getItem('access_token');
      const userId = localStorage.getItem('user_id');
      const tenantId = localStorage.getItem('tenant_id');
      const userPhone = localStorage.getItem('user_phone');
      const userName = localStorage.getItem('user_name');
      const userEmail = localStorage.getItem('user_email');
      const tenantName = localStorage.getItem('tenant_name');

      if (accessToken && userId && tenantId) {
        setUser({
          id: userId,
          phone: userPhone || '',
          fullName: userName || undefined,
          email: userEmail || undefined,
          tenantId: tenantId,
          tenantName: tenantName || undefined
        });
      }
    };

    loadUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    // Store in localStorage
    localStorage.setItem('user_id', userData.id);
    localStorage.setItem('tenant_id', userData.tenantId);
    if (userData.phone) localStorage.setItem('user_phone', userData.phone);
    if (userData.fullName) localStorage.setItem('user_name', userData.fullName);
    if (userData.email) localStorage.setItem('user_email', userData.email);
    if (userData.tenantName) localStorage.setItem('tenant_name', userData.tenantName);
  };

  const logout = () => {
    setUser(null);
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('user_phone');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('tenant_name');
    console.log('User logged out, localStorage cleared');
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);

    // Update localStorage
    if (userData.fullName) localStorage.setItem('user_name', userData.fullName);
    if (userData.email) localStorage.setItem('user_email', userData.email);
    if (userData.tenantName) localStorage.setItem('tenant_name', userData.tenantName);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
