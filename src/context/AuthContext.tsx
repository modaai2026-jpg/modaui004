import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth, db, doc, getDoc } from '../services/firebase';
import { apiService } from '../services/api';

interface AppUser {
  uid: string;
  email?: string;
  role: string;
  displayName?: string;
}

interface AuthContextType {
  user: AppUser | null;
  role: string | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as { role?: string };
        setRole(data.role || 'customer');
      } else {
        setRole('customer');
      }
    } catch (e) {
      console.error('Error fetching user role:', e);
      setRole('customer');
    }
  };

  const restoreBackendSession = async () => {
    const sessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null;
    if (!sessionId) return false;

    try {
      const response = await apiService.auth.me(sessionId);
      if (response.success && response.user) {
        setUser({ uid: response.user.id, email: response.user.email, role: response.user.role, displayName: response.user.username });
        setRole(response.user.role || 'customer');
        return true;
      }
    } catch (e) {
      console.warn('Failed to restore backend session:', e);
    }
    return false;
  };

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      if (auth) {
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!isMounted) return;

          if (firebaseUser) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || undefined,
              role: 'customer',
              displayName: firebaseUser.displayName || undefined
            });
            await fetchRole(firebaseUser.uid);
          } else {
            const restored = await restoreBackendSession();
            if (!restored) {
              setUser(null);
              setRole(null);
            }
          }
          setLoading(false);
        });
      } else {
        const restored = await restoreBackendSession();
        if (!restored) {
          setUser(null);
          setRole(null);
        }
        setLoading(false);
      }
    };

    void init();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
    } catch (e) {
      console.warn('Firebase sign out failed:', e);
    }
    localStorage.removeItem('sessionId');
    setUser(null);
    setRole(null);
  };

  const refreshRole = async () => {
    if (user?.uid && auth?.currentUser) {
      await fetchRole(user.uid);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
