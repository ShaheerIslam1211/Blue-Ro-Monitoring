import { useState, useEffect } from "react";
import { useAtom } from 'jotai';
import { regionsAtom } from "@/store/atoms/regionsAtom";
import { SelectSearch } from "@/components/SelectSearch";
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { usersUnderMeService } from "@/services/usersUnderMeService";

export function RegionsTab({ userId }) {
  const [regions] = useAtom(regionsAtom);
  const [userRegions, setUserRegions] = useState([]); // Array of { regionId, read, write }
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [newRegion, setNewRegion] = useState({ 
    regionId: '', 
    read: false, 
    write: false 
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Load user's region assignments on mount
  useEffect(() => {
    const loadUserRegions = async () => {
      setIsLoading(true);
      try {
        const userData = await usersUnderMeService.getUser(userId);
        if (userData?.regionAccess) {
          const regionsList = Object.entries(userData.regionAccess).map(([regionId, access]) => ({
            regionId,
            read: access.read || false,
            write: access.write || false
          }));
          setUserRegions(regionsList);
        }
      } catch (error) {
        console.error('Error loading user regions:', error);
        setMessage({ text: 'Error loading region data', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRegions();
  }, [userId]);

  // Get available regions that haven't been added yet
  const availableRegions = regions.filter(region => 
    !userRegions.some(ur => ur.regionId === region.id)
  );

  const handleAddRegion = async () => {
    setIsActionLoading(true);
    try {
      if (!newRegion.regionId) {
        setMessage({ text: 'Please select a region', type: 'error' });
        return;
      }

      const updatedRegions = [...userRegions, { 
        regionId: newRegion.regionId,
        read: newRegion.read,
        write: newRegion.write
      }];

      await usersUnderMeService.updateUser(userId, {
        regionAccess: updatedRegions.reduce((acc, region) => ({
          ...acc,
          [region.regionId]: { read: region.read, write: region.write }
        }), {})
      });

      setUserRegions(updatedRegions);
      setIsAddModalOpen(false);
      setNewRegion({ regionId: '', read: false, write: false });
      setMessage({ text: 'Region added successfully!', type: 'success' });
    } catch (error) {
      console.error('Error adding region:', error);
      setMessage({ text: 'Error adding region', type: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditRegion = async () => {
    try {
      const updatedRegions = userRegions.map(region => 
        region.regionId === selectedRegion.regionId ? selectedRegion : region
      );

      await usersUnderMeService.updateUser(userId, {
        regionAccess: updatedRegions.reduce((acc, region) => ({
          ...acc,
          [region.regionId]: { read: region.read, write: region.write }
        }), {})
      });

      setUserRegions(updatedRegions);
      setIsEditModalOpen(false);
      setSelectedRegion(null);
      setMessage({ text: 'Region updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating region:', error);
      setMessage({ text: 'Error updating region', type: 'error' });
    }
  };

  const handleDeleteRegion = async (regionId) => {
    try {
      const updatedRegions = userRegions.filter(region => region.regionId !== regionId);
      
      await usersUnderMeService.updateUser(userId, {
        regionAccess: updatedRegions.reduce((acc, region) => ({
          ...acc,
          [region.regionId]: { read: region.read, write: region.write }
        }), {})
      });

      setUserRegions(updatedRegions);
      setMessage({ text: 'Region removed successfully!', type: 'success' });
    } catch (error) {
      console.error('Error removing region:', error);
      setMessage({ text: 'Error removing region', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search regions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Region
        </button>
      </div>

      {/* Regions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading region data...</div>
        ) : userRegions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No regions found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Read Access
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Write Access
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userRegions
                .filter(userRegion => {
                  const regionData = regions.find(r => r.id === userRegion.regionId);
                  return regionData?.name.toLowerCase().includes(searchTerm.toLowerCase());
                })
                .map((userRegion) => {
                  const regionData = regions.find(r => r.id === userRegion.regionId);
                  return (
                    <tr key={userRegion.regionId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{regionData?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          userRegion.read ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {userRegion.read ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          userRegion.write ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {userRegion.write ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedRegion(userRegion);
                              setIsEditModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRegion(userRegion.regionId)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Region Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Region</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Region</label>
                <SelectSearch
                  options={availableRegions.map(region => ({
                    id: region.id,
                    name: region.name
                  }))}
                  value={newRegion.regionId}
                  onChange={(value) => setNewRegion({ ...newRegion, regionId: value })}
                  displayValue={regions.find(r => r.id === newRegion.regionId)?.name}
                  placeholder="Search for a region..."
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newRegion.read}
                    onChange={(e) => setNewRegion({ ...newRegion, read: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Read Access</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newRegion.write}
                    onChange={(e) => setNewRegion({ ...newRegion, write: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Write Access</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRegion}
                disabled={!newRegion.regionId || isActionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed inline-flex items-center"
              >
                {isActionLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </>
                ) : (
                  'Add Region'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Region Modal */}
      {isEditModalOpen && selectedRegion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Region: {regions.find(r => r.id === selectedRegion.regionId)?.name}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedRegion.read}
                    onChange={(e) => setSelectedRegion({ ...selectedRegion, read: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Read Access</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedRegion.write}
                    onChange={(e) => setSelectedRegion({ ...selectedRegion, write: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Write Access</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedRegion(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditRegion}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Toast */}
      {message.text && (
        <div className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : (
            <XMarkIcon className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}
    </div>
  );
}

export default RegionsTab; 