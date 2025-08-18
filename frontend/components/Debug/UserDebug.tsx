'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/hooks/useAuthRedirect';

export default function UserDebug() {
  const { user, role } = useAuth();
  const { userRole, isAdmin, isClient: isClientRole, isStaff } = useUserRole();

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 User Debug Info</h3>
      <div className="space-y-1">
        <p>
          <strong>User ID:</strong> {user.id}
        </p>
        <p>
          <strong>Username:</strong> {user.username || user.email}
        </p>
        <p>
          <strong>Auth Role:</strong> {role}
        </p>
        <p>
          <strong>Hook Role:</strong> {userRole}
        </p>
        <p>
          <strong>Groups:</strong> {JSON.stringify(user.groups)}
        </p>
        <p>
          <strong>isAdmin:</strong> {isAdmin ? '✅' : '❌'}
        </p>
        <p>
          <strong>isStaff:</strong> {isStaff ? '✅' : '❌'}
        </p>
        <p>
          <strong>isClient:</strong> {isClientRole ? '✅' : '❌'}
        </p>
        <hr className="my-2 border-gray-600" />
        <p className="text-yellow-300">
          <strong>Database Mapping:</strong>
        </p>
        <p>Group 1 = Admin, Group 2 = Staff, Group 3 = Client</p>
      </div>
    </div>
  );
}
