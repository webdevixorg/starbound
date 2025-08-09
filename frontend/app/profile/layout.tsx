'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Don't render anything until mounted
  if (!hasMounted) {
    return null;
  }

  return <ProfileLayoutClient>{children}</ProfileLayoutClient>;
}

// Separate client component
const ProfileLayoutClient: React.FC<ProfileLayoutProps> = ({ children }) => {
  const { role, loading, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sidebarMenuItems, setSidebarMenuItems] = useState<any[]>([]);

  // Import sidebar menu items dynamically
  useEffect(() => {
    import('@/lists/sidebarMenuItems').then((module) => {
      setSidebarMenuItems(module.default || []);
    });
  }, []);

  // Check authentication status
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [loading, isAuthenticated, router]);

  // Filter sidebar items based on user role and ensure valid hrefs
  const filteredMenuItems = React.useMemo(() => {
    return sidebarMenuItems
      .filter((item) => {
        if (
          (Array.isArray(item.type) && item.type.includes('all')) ||
          item.type === 'all'
        ) {
          return true;
        }
        return Array.isArray(item.type)
          ? item.type.includes(role)
          : item.type === role;
      })
      .filter((item) => {
        // Filter out items with invalid hrefs
        const href = item.to || item.href;
        return href && typeof href === 'string' && href.length > 0;
      })
      .map((item) => ({
        ...item,
        // Normalize href property
        href: item.to || item.href || '#',
      }));
  }, [role, sidebarMenuItems]);

  // Show loading while authentication is being checked
  if (loading || sidebarMenuItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Lazy load components */}
      <LazyDashboardHeader />
      <div className="profile-content">
        <div className="flex min-h-[calc(100vh-64px)]">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 bg-white border-r border-gray-200">
            <LazySidebar filteredMenuItems={filteredMenuItems} />
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            <main className="flex-1 bg-white">
              {error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              ) : (
                children
              )}
            </main>
          </div>
        </div>
      </div>
      <LazyFooter />
      <MobileMenu filteredMenuItems={filteredMenuItems} />
    </div>
  );
};

// Lazy load header
const LazyDashboardHeader = () => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import('@/components/PageComponents/Header/DashboardHeader').then((mod) => {
      setComponent(() => mod.default);
    });
  }, []);

  if (!Component)
    return <div className="h-16 bg-white border-b border-gray-200"></div>;
  return <Component />;
};

// Lazy load sidebar
const LazySidebar = ({ filteredMenuItems }: { filteredMenuItems: any[] }) => {
  const [Sidebar, setSidebar] = useState<React.ComponentType<any> | null>(null);
  const [SidebarItem, setSidebarItem] =
    useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    Promise.all([
      import(
        '@/components/PageComponents/Sidebar/ProfileSidebar/ProfileSidebar'
      ),
      import('@/components/PageComponents/Sidebar/ProfileSidebar/SidebarItem'),
    ]).then(([sidebarMod, itemMod]) => {
      setSidebar(() => sidebarMod.default);
      setSidebarItem(() => itemMod.SidebarItem);
    });
  }, []);

  if (!Sidebar || !SidebarItem) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <Sidebar>
      {filteredMenuItems.map((item, index) => (
        <SidebarItem
          key={`${item.href}-${index}`}
          icon={item.icon}
          text={item.text}
          href={item.href}
          alert={item.alert}
          subLinks={item.subLinks}
        />
      ))}
    </Sidebar>
  );
};

// Lazy load footer
const LazyFooter = () => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import('@/components/PageComponents/Footer').then((mod) => {
      setComponent(() => mod.default);
    });
  }, []);

  if (!Component) return <div className="h-20 bg-gray-800"></div>;
  return <Component />;
};

// Mobile menu component
const MobileMenu: React.FC<{ filteredMenuItems: any[] }> = ({
  filteredMenuItems,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                {filteredMenuItems.map((item, index) => (
                  <Link
                    key={`mobile-${item.href}-${index}`}
                    href={item.href}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon && (
                        <span className="text-lg">{item.icon}</span>
                      )}
                      <span>{item.text}</span>
                      {item.alert && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {item.alert}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
