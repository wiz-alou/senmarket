'use client';

import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';

// Types simplifiés
interface User {
  id: string;
  phone: string;
  email?: string;
  first_name: string;
  last_name: string;
  region: string;
  is_verified: boolean;
  created_at: string;
}

interface RegisterRequest {
  phone: string;
  email?: string;
  first_name: string;
  last_name: string;
  password: string;
  region: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Service auth complet
const authService = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('senmarket_token', token);
      console.log('✅ [AUTH] Token stocké');
    }
  },
  
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('senmarket_token');
    }
    return null;
  },
  
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('senmarket_token');
      sessionStorage.removeItem('pending_registration');
      console.log('🗑️ [AUTH] Tokens supprimés');
    }
  },
  
  logout: () => {
    console.log('🚪 [AUTH SERVICE] Logout complet');
    
    if (typeof window !== 'undefined') {
      // Nettoyer TOUT le localStorage/sessionStorage
      localStorage.removeItem('senmarket_token');
      sessionStorage.removeItem('pending_registration');
      sessionStorage.clear();
      
      // Force redirect avec replace pour éviter l'historique
      setTimeout(() => {
        window.location.replace('/auth/login');
      }, 100);
    }
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // FIX: Memoiser checkAuth pour éviter les re-créations
  const checkAuth = useCallback(async () => {
    try {
      const token = authService.getToken();
      console.log('🔍 [AUTH] Vérification token:', token ? 'TROUVÉ' : 'ABSENT');
      
      if (token) {
        const response = await fetch('http://localhost:8080/api/v1/auth/profile', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        });
        
        console.log('🔍 [AUTH] Profile response:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ [AUTH] Utilisateur trouvé:', result.data?.first_name);
          setUser(result.data || result);
        } else {
          console.log('❌ [AUTH] Token invalide, nettoyage');
          authService.removeToken();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('❌ [AUTH] Erreur check auth:', error);
      authService.removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []); // Pas de dépendances pour éviter les boucles

  // FIX: useEffect avec dépendance stable
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // FIX: Memoiser login pour éviter les re-renders
  const login = useCallback(async (phone: string, password: string) => {
    try {
      console.log('🔐 [AUTH] Tentative connexion:', phone);
      
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });

      const result = await response.json();
      console.log('📥 [AUTH] Réponse login:', response.status);

      if (!response.ok) {
        throw new Error(result.error || 'Erreur connexion');
      }

      if (result.data && result.data.token) {
        authService.setToken(result.data.token);
        setUser(result.data.user);
        console.log('✅ [AUTH] Connexion réussie');
      }
    } catch (error) {
      console.error('❌ [AUTH] Erreur login:', error);
      throw error;
    }
  }, []);

  // FIX: Memoiser register pour éviter les re-renders
  const register = useCallback(async (data: RegisterRequest) => {
    try {
      console.log('📝 [AUTH] Inscription:', data.phone);
      
      const cleanData = {
        phone: data.phone.trim(),
        email: data.email && data.email.trim() ? data.email.trim() : undefined,
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        password: data.password,
        region: data.region.trim()
      };

      if (!cleanData.email) {
        delete cleanData.email;
      }

      const response = await fetch('http://localhost:8080/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
      });

      const result = await response.json();
      console.log('📥 [AUTH] Réponse inscription:', response.status);

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Erreur inscription');
      }

      // Stocker temporairement pour vérification SMS
      if (typeof window !== 'undefined' && result.data) {
        sessionStorage.setItem('pending_registration', JSON.stringify({
          user: result.data.user,
          token: result.data.token,
          phone: cleanData.phone
        }));
      }

      return result;
    } catch (error) {
      console.error('❌ [AUTH] Erreur registration:', error);
      throw error;
    }
  }, []);

  // FIX: Memoiser logout pour éviter les re-renders
  const logout = useCallback(() => {
    console.log('🚪 [AUTH] Déconnexion démarrée');
    
    // Reset l'état local immédiatement
    setUser(null);
    
    // Nettoyer le storage
    authService.removeToken();
    
    console.log('✅ [AUTH] Déconnexion terminée');
    
    // Redirection forcée
    if (typeof window !== 'undefined') {
      window.location.replace('/auth/login');
    }
  }, []);

  // Fonction pour finaliser après vérification SMS
  const completeRegistration = useCallback(() => {
    if (typeof window !== 'undefined') {
      const pendingData = sessionStorage.getItem('pending_registration');
      if (pendingData) {
        const { user, token } = JSON.parse(pendingData);
        authService.setToken(token);
        setUser(user);
        sessionStorage.removeItem('pending_registration');
        return true;
      }
    }
    return false;
  }, []);

  // FIX: Memoiser la valeur du contexte pour éviter les re-renders
  const contextValue = React.useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }), [user, loading, login, register, logout]);

  return React.createElement(
    AuthContext.Provider,
    {
      value: contextValue
    },
    children
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook pour vérification SMS (inchangé)
export function useCompleteRegistration() {
  const { logout } = useAuth();
  
  const completeRegistration = useCallback(async (code: string) => {
    try {
      const pendingData = sessionStorage.getItem('pending_registration');
      if (!pendingData) {
        throw new Error('Aucune inscription en attente');
      }

      const { phone } = JSON.parse(pendingData);

      const response = await fetch('http://localhost:8080/api/v1/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Code invalide');
      }

      // Finaliser l'inscription
      const { user, token } = JSON.parse(pendingData);
      localStorage.setItem('senmarket_token', token);
      sessionStorage.removeItem('pending_registration');
      
      // Recharger la page pour actualiser l'état
      window.location.replace('/dashboard');
      
      return true;
    } catch (error) {
      console.error('❌ Erreur vérification:', error);
      throw error;
    }
  }, []);

  return { completeRegistration };
}