import { useMemo, useState, useEffect } from 'react';
import { db, doc, onSnapshot } from '../services/firebase';

export type UserRole = 'admin' | 'founder' | 'manager' | 'staff' | 'customer';

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['all'],
  founder: ['merchant_manage', 'store_manage', 'product_manage', 'order_manage', 'finance_read'],
  manager: ['store_manage', 'product_manage', 'order_manage'],
  staff: ['order_manage', 'product_read'],
  customer: ['shop_view', 'cart_manage', 'order_create']
};

export function usePermission(userRole: UserRole | null) {
  const [dynamicPermissions, setDynamicPermissions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Listen to real-time RBAC updates from Firestore
    const unsub = onSnapshot(doc(db, 'system', 'rbac_config'), (snap: any) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.matrix) {
          // Convert matrix { role: { perm: boolean } } to { role: string[] }
          const matrix = data.matrix;
          const mapped: Record<string, string[]> = {};
          Object.entries(matrix).forEach(([role, perms]: [string, any]) => {
            mapped[role] = Object.entries(perms)
              .filter(([_, active]) => active)
              .map(([perm]) => perm);
          });
          setDynamicPermissions(mapped);
        }
      }
    });
    return () => unsub();
  }, []);

  const permissions = useMemo(() => {
    if (!userRole) return [];
    // Prefer dynamic permissions from Firestore, fallback to defaults
    return dynamicPermissions[userRole] || DEFAULT_ROLE_PERMISSIONS[userRole] || [];
  }, [userRole, dynamicPermissions]);

  const hasPermission = (perm: string) => {
    if (permissions.includes('all')) return true;
    return permissions.includes(perm);
  };

  return { permissions, hasPermission };
}
