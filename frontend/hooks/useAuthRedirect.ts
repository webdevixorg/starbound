'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Authentication Hooks Collection
 *
 * Available hooks:
 * - useAuthRedirect: Generic hook with custom options
 * - useAdminAuth: Admin access only (group 1)
 * - useCustomerAuth: Client/Customer access only (group 3)
 * - useStaffAuth: Staff access using generic hook (group 2)
 * - useAdminOnlyAuth: Admin access only with custom logic
 * - useStaffOnlyAuth: Staff access only with custom logic
 * - useAdminOrStaffAuth: Combined admin and staff access (groups 1 or 2)
 * - useAnyAuth: Any authenticated user
 * - useUserRole: Get user role without enforcing access
 */ interface UseAuthRedirectOptions {
  requiredRole?: 'admin' | 'client' | 'staff';
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

// ✅ Group ID to Role mapping (Updated to match database)
const GROUP_ROLES = {
  1: 'admin', // Group 1 = Admin
  2: 'staff', // Group 2 = Staff
  3: 'client', // Group 3 = Client
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
      } else if (userRole === 'client') {
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
          isClient: userRole === 'client',
          isStaff: userRole === 'staff',
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
    requiredRole: 'client',
    requiredGroup: 3, // Client group (updated)
    redirectTo: redirectTo || '/auth/login',
  });
}

// ✅ Hook for staff access only
export function useStaffAuth(redirectTo?: string) {
  return useAuthRedirect({
    requiredRole: 'staff',
    requiredGroup: 2, // Staff group (updated)
    redirectTo: redirectTo || '/auth/login',
  });
}

// ✅ Hook for admin access only
export function useAdminOnlyAuth(redirectTo?: string) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const getUserRole = (user: any) => {
    if (
      !user?.groups ||
      !Array.isArray(user.groups) ||
      user.groups.length === 0
    ) {
      return null;
    }
    const primaryGroupId = user.groups[0];
    return GROUP_ROLES[primaryGroupId as keyof typeof GROUP_ROLES] || 'client';
  };

  const hasAdminAccess = (user: any) => {
    return user?.groups?.includes(1); // Admin (1) only
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || authLoading) return;

    if (!user) {
      console.log('🔒 useAdminOnlyAuth: No user found, redirecting to login');
      router.push(redirectTo || '/auth/login');
      return;
    }

    console.log('🔒 useAdminOnlyAuth: User data:', {
      userId: user.id,
      groups: user.groups,
      hasAdminAccess: user?.groups?.includes(1),
    });

    if (!hasAdminAccess(user)) {
      console.log('🔒 useAdminOnlyAuth: User does not have admin access');
      const userRole = getUserRole(user);
      console.log('🔒 useAdminOnlyAuth: User role:', userRole);
      if (userRole === 'client') {
        console.log(
          '🔒 useAdminOnlyAuth: Redirecting client to profile dashboard'
        );
        router.push('/profile/dashboard');
      } else if (userRole === 'staff') {
        console.log(
          '🔒 useAdminOnlyAuth: Redirecting staff to staff dashboard'
        );
        router.push('/staff/dashboard');
      } else {
        console.log('🔒 useAdminOnlyAuth: Redirecting to login');
        router.push('/auth/login');
      }
      return;
    }

    console.log('🔒 useAdminOnlyAuth: Access granted');
  }, [isClient, authLoading, user, redirectTo, router]);

  const userRole = getUserRole(user);
  const isAuthorized = isClient && !authLoading && user && hasAdminAccess(user);

  return {
    isClient,
    isLoading: authLoading,
    isAuthorized,
    user: user
      ? {
          ...user,
          role: userRole,
          isAdmin: userRole === 'admin',
          isClient: userRole === 'client',
          isStaff: userRole === 'staff',
        }
      : null,
  };
}

// ✅ Hook for staff access only
export function useStaffOnlyAuth(redirectTo?: string) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const getUserRole = (user: any) => {
    if (
      !user?.groups ||
      !Array.isArray(user.groups) ||
      user.groups.length === 0
    ) {
      return null;
    }
    const primaryGroupId = user.groups[0];
    return GROUP_ROLES[primaryGroupId as keyof typeof GROUP_ROLES] || 'client';
  };

  const hasStaffAccess = (user: any) => {
    return user?.groups?.includes(2); // Staff (2) updated
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || authLoading) return;

    if (!user) {
      console.log('🔒 useStaffOnlyAuth: No user found, redirecting to login');
      router.push(redirectTo || '/auth/login');
      return;
    }

    console.log('🔒 useStaffOnlyAuth: User data:', {
      userId: user.id,
      groups: user.groups,
      hasStaffAccess: user?.groups?.includes(2), // Updated
    });

    if (!hasStaffAccess(user)) {
      console.log('🔒 useStaffOnlyAuth: User does not have staff access');
      const userRole = getUserRole(user);
      console.log('🔒 useStaffOnlyAuth: User role:', userRole);
      if (userRole === 'client') {
        console.log(
          '🔒 useStaffOnlyAuth: Redirecting client to profile dashboard'
        );
        router.push('/profile/dashboard');
      } else if (userRole === 'admin') {
        console.log(
          '🔒 useStaffOnlyAuth: Redirecting admin to admin dashboard'
        );
        router.push('/admin/dashboard');
      } else {
        console.log('🔒 useStaffOnlyAuth: Redirecting to login');
        router.push('/auth/login');
      }
      return;
    }

    console.log('🔒 useStaffOnlyAuth: Access granted');
  }, [isClient, authLoading, user, redirectTo, router]);

  const userRole = getUserRole(user);
  const isAuthorized = isClient && !authLoading && user && hasStaffAccess(user);

  return {
    isClient,
    isLoading: authLoading,
    isAuthorized,
    user: user
      ? {
          ...user,
          role: userRole,
          isAdmin: userRole === 'admin',
          isClient: userRole === 'client',
          isStaff: userRole === 'staff',
        }
      : null,
  };
}

// ✅ Hook for combined admin and staff access
export function useAdminOrStaffAuth(redirectTo?: string) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const getUserRole = (user: any) => {
    if (
      !user?.groups ||
      !Array.isArray(user.groups) ||
      user.groups.length === 0
    ) {
      return null;
    }
    const primaryGroupId = user.groups[0];
    return GROUP_ROLES[primaryGroupId as keyof typeof GROUP_ROLES] || 'client';
  };

  const hasAdminOrStaffAccess = (user: any) => {
    return user?.groups?.includes(1) || user?.groups?.includes(2); // Admin (1) or Staff (2)
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || authLoading) return;

    if (!user) {
      console.log(
        '🔒 useAdminOrStaffAuth: No user found, redirecting to login'
      );
      router.push(redirectTo || '/auth/login');
      return;
    }

    console.log('🔒 useAdminOrStaffAuth: User data:', {
      userId: user.id,
      groups: user.groups,
      hasAdminAccess: user?.groups?.includes(1),
      hasStaffAccess: user?.groups?.includes(2), // Updated
    });

    if (!hasAdminOrStaffAccess(user)) {
      console.log(
        '🔒 useAdminOrStaffAuth: User does not have admin or staff access'
      );
      const userRole = getUserRole(user);
      console.log('🔒 useAdminOrStaffAuth: User role:', userRole);
      if (userRole === 'client') {
        console.log(
          '🔒 useAdminOrStaffAuth: Redirecting client to profile dashboard'
        );
        router.push('/profile/dashboard');
      } else {
        console.log('🔒 useAdminOrStaffAuth: Redirecting to login');
        router.push('/auth/login');
      }
      return;
    }

    console.log('🔒 useAdminOrStaffAuth: Access granted');
  }, [isClient, authLoading, user, redirectTo, router]);

  const userRole = getUserRole(user);
  const isAuthorized =
    isClient && !authLoading && user && hasAdminOrStaffAccess(user);

  return {
    isClient,
    isLoading: authLoading,
    isAuthorized,
    user: user
      ? {
          ...user,
          role: userRole,
          isAdmin: userRole === 'admin',
          isClient: userRole === 'client',
          isStaff: userRole === 'staff',
        }
      : null,
  };
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
    return GROUP_ROLES[primaryGroupId as keyof typeof GROUP_ROLES] || 'client';
  };

  const userRole = getUserRole(user);

  return {
    user: user
      ? {
          ...user,
          role: userRole,
          isAdmin: userRole === 'admin',
          isClient: userRole === 'client',
          isStaff: userRole === 'staff',
        }
      : null,
    userRole,
    loading,
    isAdmin: userRole === 'admin',
    isClient: userRole === 'client',
    isStaff: userRole === 'staff',
  };
}
