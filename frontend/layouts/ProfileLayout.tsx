import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // Custom hook to get auth state (e.g., user role, loading)
import Sidebar from '@/components/PageComponents/Sidebar/ProfileSidebar/ProfileSidebar'; // Sidebar component
import DashboardHeader from '@/components/PageComponents/Header/DashboardHeader'; // Header component
import Footer from '@/components/PageComponents/Footer'; // Footer component
import { SidebarItem } from '@/components/PageComponents/Sidebar/ProfileSidebar/SidebarItem'; // Individual sidebar item
import sidebarMenuItems from '@/lists/sidebarMenuItems'; // Sidebar item list with role-based visibility
import LoadingSpinner from '@/components/Common/Loading'; // Spinner shown during loading

const ProfileLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { role, loading } = useAuth(); // Get user role and loading state from context
  const [error, setError] = useState<string | null>(null); // Optional error state

  // Side effect: If auth finished loading and there's no role, clear any existing error
  useEffect(() => {
    if (!loading && !role) {
      setError(null);
    }
  }, [loading, role]);

  // Dynamically filter sidebar items based on user role ('admin', 'staff', etc.)
  const filteredMenuItems = sidebarMenuItems.filter((item) => {
    if (Array.isArray(item.type)) {
      return (
        item.type.includes('all') || (role !== null && item.type.includes(role))
      );
    }
    return item.type === 'all' || item.type === role;
  });

  return (
    <>
      {/* Header at the top of the profile layout */}
      <DashboardHeader />

      {/* Main layout container */}
      <div className="profile-content">
        <div className="flex items-start justify-between">
          {/* Sidebar on the left */}
          <Sidebar>
            {filteredMenuItems.map((item, index) => (
              <SidebarItem
                key={index}
                icon={item.icon}
                text={item.text}
                href={item.href}
                alert={item.alert}
                subLinks={item.subLinks}
              />
            ))}
          </Sidebar>

          {/* Main content area on the right */}
          <div className="flex flex-col w-full pl-0 md:space-y-4">
            {/* Show loading spinner if loading */}
            {loading ? (
              <div className="flex justify-center items-center h-full py-20">
                <LoadingSpinner />
              </div>
            ) : error ? (
              // If there's an error, show it
              <div>{error}</div>
            ) : (
              // If no loading or error, render the children content
              children
            )}
          </div>
        </div>
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </>
  );
};

export default ProfileLayout;
