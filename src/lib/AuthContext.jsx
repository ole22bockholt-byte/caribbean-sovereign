import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

// Normalisiert den Supabase-User auf die Felder, die die UI erwartet
// (email direkt, full_name aus den user_metadata).
function normalizeUser(user) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    ...user,
    full_name: meta.full_name || meta.name || null,
    // Rolle für Admin-Ansichten: liegt in app_metadata (nicht vom User änderbar).
    role: user.app_metadata?.role || 'user',
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let active = true;

    // Bestehende Session laden (supabase-js liest sie aus dem localStorage bzw.
    // aus der URL nach OAuth-/Recovery-Redirects).
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!active) return;
        setUser(normalizeUser(session?.user ?? null));
        setIsAuthenticated(!!session);
        setIsLoadingAuth(false);
        setAuthChecked(true);
      })
      .catch((error) => {
        if (!active) return;
        setAuthError({ type: 'unknown', message: error.message || 'Auth-Fehler' });
        setIsLoadingAuth(false);
        setAuthChecked(true);
      });

    // Auf Login/Logout/Token-Refresh reagieren und den Zustand synchron halten.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(normalizeUser(session?.user ?? null));
      setIsAuthenticated(!!session);
      setAuthChecked(true);
      setIsLoadingAuth(false);
    });

    return () => {
      active = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  // Für Kompatibilität mit ProtectedRoute: Session erneut prüfen.
  const checkUserAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(normalizeUser(session?.user ?? null));
    setIsAuthenticated(!!session);
    setAuthChecked(true);
    setIsLoadingAuth(false);
  };

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      window.location.href = `${import.meta.env.BASE_URL}login`;
    }
  };

  const navigateToLogin = () => {
    window.location.href = `${import.meta.env.BASE_URL}login`;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      // Ehemals Base44-spezifisch — bleibt zur Kompatibilität, jetzt immer „fertig".
      isLoadingPublicSettings: false,
      authError,
      appPublicSettings: null,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState: checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
