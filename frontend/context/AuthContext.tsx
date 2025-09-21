'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { User, AuthContextType, Profile } from '@/types/types';
import { biDirectionalSyncVisits, fetchProfile } from '@/services/api';
import SignOutModal from '@/components/Modals/SignOutModal';

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<'admin' | 'staff' | 'client' | null>(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const isTokenExpired = (token: string) => {
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  const fetchUserDetails = useCallback(async () => {
    try {
      const profileData = await fetchProfile();
      const userData = profileData.user;
      setUser(userData ?? null);
      setProfile(profileData);

      if (Array.isArray(userData?.groups)) {
        if (userData.groups.includes(1)) {
          setRole('admin'); // Group 1 = Admin
        } else if (userData.groups.includes(2)) {
          setRole('staff'); // Group 2 = Staff
        } else if (userData.groups.includes(3)) {
          setRole('client'); // Group 3 = Client
        } else {
          setRole('client'); // default to client
        }
      } else {
        setRole(null);
      }
    } catch (error: any) {
      console.error('Error fetching user details:', error);

      // If it's an authentication error (401/403), sign out the user
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
        setProfile(null);
      } else {
        // For other errors, just clear user data but keep authentication state
        setUser(null);
        setRole(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount, check token and update isAuthenticated
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      if (isTokenExpired(token)) {
        // Clear expired token without triggering confirmSignOut to avoid redirect loop
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
      } else {
        setIsAuthenticated(true);
      }
    }
    setLoading(false);
  }, []);

  // Fetch user details when authentication status changes to true
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetchUserDetails();
    } else {
      setUser(null);
      setProfile(null);
      setRole(null);
      setLoading(false);
    }
  }, [isAuthenticated, fetchUserDetails]);

  // NEW: Sync visits from backend whenever user is authenticated and user data is loaded
  useEffect(() => {
    if (isAuthenticated && user) {
      biDirectionalSyncVisits(true).catch((err) => {
        console.error('Failed to sync visits on login:', err);
      });
    }
  }, [isAuthenticated, user]);

  const signin = (tokens: { access: string; refresh: string }) => {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    setIsAuthenticated(true);
  };

  const signout = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setUser(null);
    setRole(null);
    router.push('/signin');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        user,
        profile,
        role,
        signin,
        signout,
      }}
    >
      {children}
      <SignOutModal
        showModal={showSignOutModal}
        setShowModal={setShowSignOutModal}
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOutModal(false)}
      />
    </AuthContext.Provider>
  );
};
