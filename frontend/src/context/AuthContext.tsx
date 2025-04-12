import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { fetchProfile } from '../services/api';
import { User, AuthContextType, Profile } from '../types/types';
import SignOutModal from '../components/Modals/SignOutModal';

const AuthContext = createContext<AuthContextType | null>(null);

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
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<'admin' | 'customer' | null>(null); // Track role
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      if (isTokenExpired(token)) {
        confirmSignOut();
      } else {
        setIsAuthenticated(true);
        fetchUserDetails();
      }
    } else {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, []);

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

  const fetchUserDetails = async () => {
    try {
      const profileData = await fetchProfile();
      const userData = profileData.user;
      setUser(userData);
      setProfile(profileData);

      if (
        Array.isArray(userData?.groups) &&
        userData.groups.every((group) => typeof group === 'number')
      ) {
        // Example operation: Check if the user is in group 1
        if (userData.groups.includes(1)) {
          setRole('admin');
        } else {
          setRole('customer');
        }
      } else {
        console.error('userData.groups is not an array of numbers');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

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
    setRole(null); // Clear the role when logging out
    navigate('/signin'); // Redirect to sign-in page
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
        onCancel={() => setShowSignOutModal(false)} // Handle cancel action
      />
    </AuthContext.Provider>
  );
};
