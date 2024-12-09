import React, { useEffect, useState } from 'react';
import { usersUnderMeService } from '@/services/usersUnderMeService';

const ReadWriteControl = ({ id }) => {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tempPermissions, setTempPermissions] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const userData = await usersUnderMeService.getUser(id);
        setPermissions(userData || {});
        setTempPermissions(userData || {});
      } catch (error) {
        console.error('Error fetching user permissions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handlePermissionChange = (key, checked) => {
    setTempPermissions(prev => ({ ...prev, [key]: checked }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Find changed permissions
      const updates = {};
      Object.keys(tempPermissions).forEach(key => {
        if (tempPermissions[key] !== permissions[key]) {
          updates[key] = tempPermissions[key];
        }
      });

      await usersUnderMeService.updateUser(id, updates);
      setPermissions(tempPermissions);
      setIsDirty(false);
    } catch (error) {
      console.error('Error updating permissions:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempPermissions(permissions);
    setIsDirty(false);
  };

  const modules = [
    { key: 'clients', label: 'Clients' },
    // { key: 'users', label: 'Users' }, commented because users right now should only be controlled by super admin
    { key: 'regions', label: 'Regions' },
    { key: 'plants', label: 'Plants' },
  ];

  const actions = ['create', 'delete'];// removed read write

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading permissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">User Permissions</h2>
        {isDirty && (
          <div className="space-x-3">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Module
              </th>
              {actions.map(action => (
                <th 
                  key={action}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {modules.map(module => (
              <tr key={module.key} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {module.label}
                </td>
                {actions.map(action => (
                  <td key={`${module.key}_${action}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={tempPermissions?.[`${module.key}_${action}`] || false}
                        onChange={(e) => handlePermissionChange(`${module.key}_${action}`, e.target.checked)}
                        disabled={saving}
                        className="
                          form-checkbox
                          h-5 w-5
                          text-blue-600
                          rounded
                          border-gray-300
                          focus:ring-blue-500
                          transition-colors
                          duration-200
                          ease-in-out
                          cursor-pointer
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                      />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReadWriteControl;