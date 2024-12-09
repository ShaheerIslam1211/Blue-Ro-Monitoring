import { getDefaultStore } from 'jotai';
import { userAtom } from '@/store/atoms/userAtom';
import { whoami } from './whoami';

// Base permission check functions
const isSuperAdmin = () => whoami() === 'super_admin';

const checkPermission = (permissionKey) => {
  try {
    const user = getDefaultStore().get(userAtom);
    return user?.[permissionKey] === true || isSuperAdmin();
  } catch (error) {
    console.error(`Error checking permission ${permissionKey}:`, error);
    return false;
  }
};

// Permission check functions
export const canAccessUsers = () => isSuperAdmin();

export const canAddClients = () => checkPermission('clients_create');
export const canDeleteClients = () => checkPermission('clients_delete');

export const canAddRegions = () => checkPermission('regions_create');
export const canDeleteRegions = () => checkPermission('regions_delete');

export const canAddPlants = () => checkPermission('plants_create');
export const canDeletePlants = () => checkPermission('plants_delete');
