'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface UseAuthRedirectOptions {
  requiredRole?: 'admin' | 'customer' | 'moderator';
  requiredGroup?: number;
  redirectTo?: string;
  requireAuth?: boolean;
}

interface UseAuthRedirectReturn {
  isClient: boolean;
  isLoading: boolean;
  isAuthorized: boolean;
  user: any;
}

// ✅ Group ID to Role mapping
const GROUP_ROLES = {
  1: 'admin', // Group 1 = Admin
  2: 'customer', // Group 2 = Customer
  3: 'moderator', // Group 3 = Moderator (optional)
} as const;

export function useAuthRedirect(
  options: UseAuthRedirectOptions = {}
): UseAuthRedirectReturn {
  const {
    requiredRole,
    requiredGroup,
    redirectTo = '/signin',
    requireAuth = true,
  } = options;

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // ✅ Helper function to get user role from groups
  const getUserRole = (user: any) => {
    if (
      !user?.groups ||
      !Array.isArray(user.groups) ||
      user.groups.length === 0
    ) {
      return null;
    }

    // Get the first group (primary group)
    const primaryGroupId = user.groups[0];
    return (
      GROUP_ROLES[primaryGroupId as keyof typeof GROUP_ROLES] || 'customer'
    ); // Default to customer
  };

  // ✅ Helper function to check if user has required group
  const hasRequiredGroup = (user: any, groupId: number) => {
    return user?.groups?.includes(groupId);
  };

  // ✅ Helper function to check if user has required role
  const hasRequiredRole = (user: any, role: string) => {
    const userRole = getUserRole(user);
    return userRole === role;
  };

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle authentication and authorization
  useEffect(() => {
    if (!isClient || authLoading) return;

    // Check if authentication is required
    if (requireAuth && !user) {
      console.log('No user found, redirecting to login');
      router.push(redirectTo);
      return;
    }

    const userRole = getUserRole(user);
    console.log(
      'User role determined:',
      userRole,
      'from groups:',
      user?.groups
    );

    // Check if specific role is required
    if (requiredRole && user && userRole !== requiredRole) {
      console.log(`User role: ${userRole}, required: ${requiredRole}`);

      // Redirect based on user role
      if (userRole === 'admin') {
        router.push('/admin/dashboard');
      } else if (userRole === 'customer') {
        router.push('/profile/dashboard');
      } else {
        router.push('/auth/login');
      }
      return;
    }

    // Check if specific group is required
    if (requiredGroup && user && !hasRequiredGroup(user, requiredGroup)) {
      console.log(
        `User groups: ${user.groups}, required group: ${requiredGroup}`
      );
      router.push('/auth/login');
      return;
    }
  }, [
    isClient,
    authLoading,
    user,
    requiredRole,
    requiredGroup,
    requireAuth,
    redirectTo,
    router,
  ]);

  // Determine if user is authorized
  const userRole = getUserRole(user);
  const isAuthorized =
    isClient &&
    !authLoading &&
    (!requireAuth ||
      (user &&
        (!requiredRole || userRole === requiredRole) &&
        (!requiredGroup || hasRequiredGroup(user, requiredGroup))));

  // ✅ Return user with computed role
  return {
    isClient,
    isLoading: authLoading,
    isAuthorized,
    user: user
      ? {
          ...user,
          role: userRole,
          isAdmin: userRole === 'admin',
          isCustomer: userRole === 'customer',
          isModerator: userRole === 'moderator',
        }
      : null,
  };
}

// ✅ Convenience hooks for different roles
export function useAdminAuth(redirectTo?: string) {
  return useAuthRedirect({
    requiredRole: 'admin',
    requiredGroup: 1, // Admin group
    redirectTo: redirectTo || '/auth/login',
  });
}

export function useCustomerAuth(redirectTo?: string) {
  return useAuthRedirect({
    requiredRole: 'customer',
    requiredGroup: 2, // Customer group
    redirectTo: redirectTo || '/auth/login',
  });
}

export function useAnyAuth(redirectTo?: string) {
  return useAuthRedirect({
    requireAuth: true, // Any authenticated user
    redirectTo: redirectTo || '/auth/login',
  });
}

// ✅ Hook to get user role without enforcing access
export function useUserRole() {
  const { user, loading } = useAuth();

  const getUserRole = (user: any) => {
    if (
      !user?.groups ||
      !Array.isArray(user.groups) ||
      user.groups.length === 0
    ) {
      return null;
    }
    const primaryGroupId = user.groups[0];
    return (
      GROUP_ROLES[primaryGroupId as keyof typeof GROUP_ROLES] || 'customer'
    );
  };

  const userRole = getUserRole(user);

  return {
    user: user
      ? {
          ...user,
          role: userRole,
          isAdmin: userRole === 'admin',
          isCustomer: userRole === 'customer',
          isModerator: userRole === 'moderator',
        }
      : null,
    userRole,
    loading,
    isAdmin: userRole === 'admin',
    isCustomer: userRole === 'customer',
    isModerator: userRole === 'moderator',
  };
}
