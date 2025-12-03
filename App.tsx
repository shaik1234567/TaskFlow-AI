import React, { createContext, useContext, useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, AuthState } from './types';
import { authService } from './services/authService';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Layout } from './components/Layout';
import { ToastProvider, useToast } from './contexts/ToastContext';

// --- Auth Context ---
interface AuthContextType extends AuthState {
  login: (e: string, p: string) => Promise<void>;
  register: (n: string, e: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// --- Protected Route Wrapper ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

// --- Main App Logic ---
const AppContent: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const { showToast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const { user, token } = authService.getCurrentSession();
    if (user && token) {
      setAuth({ user, token, isAuthenticated: true, isLoading: false });
    } else {
      setAuth(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const response = await authService.login(email, pass);
      setAuth({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false
      });
      showToast('Welcome back!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Login failed', 'error');
      throw e;
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      const response = await authService.register(name, email, pass);
      setAuth({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false
      });
      showToast('Account created successfully!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Registration failed', 'error');
      throw e;
    }
  };

  const logout = async () => {
    await authService.logout();
    setAuth({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
    showToast('Signed out successfully', 'info');
  };

  const setUser = (user: User) => {
    setAuth(prev => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, register, logout, setUser }}>
      <Router>
        <Routes>
          <Route path="/login" element={auth.isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={auth.isAuthenticated ? <Navigate to="/" /> : <Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

// --- Root Component ---
const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
