import { getDefaultStore } from "jotai";
import { userAtom } from "@/store/atoms/userAtom";

export function accessCheck(id, type = 'region') {
  try {
    const user = getDefaultStore().get(userAtom);
    
    if (!user) {
      return { read: false, write: false };
    }

    // Super admin has full access to everything
    if (user.acc === 'super_admin') {
      return { read: true, write: true };
    }

    // Check access based on type
    const accessKey = type === 'region' ? 'regionAccess' : 'clientAccess';
    const access = user[accessKey]?.[id];

    if (!access) {
      return { read: false, write: false };
    }

    return {
      read: access.read || false,
      write: access.write || false
    };
  } catch (error) {
    console.error(`Error checking ${type} access:`, error);
    return { read: false, write: false };
  }
}

// Convenience wrappers for specific types
export function checkRegionAccess(regionId) {
  return accessCheck(regionId, 'region');
}

export function checkClientAccess(clientId) {
  return accessCheck(clientId, 'client');
} 