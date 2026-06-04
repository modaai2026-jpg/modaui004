import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePermission, UserRole } from '../hooks/usePermission';

interface PermissionGuardProps {
  permission?: string;
  role?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  role: requiredRole, 
  children, 
  fallback = null 
}) => {
  const { role: userRole } = useAuth();
  const { hasPermission } = usePermission(userRole as UserRole);

  if (requiredRole && userRole !== requiredRole) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
