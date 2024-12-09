import React, { useState, useEffect, Fragment } from "react";
import { useAtom } from 'jotai';
import { regionsAtom } from "@/store/atoms/regionsAtom";
import { regionsService } from "@/services/regionsService";
import {
  BuildingOfficeIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, Transition } from '@headlessui/react';
import { canAddRegions, canDeleteRegions } from '@/helper/canDoCheck';

export function Regions() {
  const [regions, setRegions] = useAtom(regionsAtom);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newRegion, setNewRegion] = useState({
    id: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [addingRegion, setAddingRegion] = useState(false);
  const [deletingRegionId, setDeletingRegionId] = useState(null);
  const navigate = useNavigate();

  const refreshRegions = async () => {
    setLoading(true);
    try {
      const fetchedRegions = await regionsService.getAllRegions();
      setRegions(fetchedRegions);
    } catch (error) {
      console.error("Error fetching regions:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateId = async () => {
    try {
      const id = await regionsService.generateUniqueId();
      setNewRegion(prev => ({ ...prev, id }));
    } catch (error) {
      setError('Error generating ID');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAddingRegion(true);
    try {
      await regionsService.createRegion(newRegion);
      setRegions((prevRegions) => [...prevRegions, newRegion]);
      setIsOpen(false);
      navigate(`/dashboard/regions/${newRegion.id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setAddingRegion(false);
    }
  };

  const handleDelete = async (regionId) => {
    if (window.confirm('Are you sure you want to delete this region?')) {
      setDeletingRegionId(regionId);
      try {
        await regionsService.deleteRegion(regionId);
        setRegions((prevRegions) => prevRegions.filter(region => region.id !== regionId));
      } catch (error) {
        console.error('Error deleting region:', error);
      } finally {
        setDeletingRegionId(null);
      }
    }
  };

  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Regions Management</h1>
          <div className="flex gap-2">
            <button
              onClick={refreshRegions}
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {canAddRegions() && (
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                <PlusIcon className="h-4 w-4" />
                Add Region
              </button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Main Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {regions.map((region) => (
                  <tr key={region.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{region.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">{region.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">{region.email || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <span className="text-sm text-gray-600 truncate block overflow-hidden">
                        {region.notes || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        <div className="group relative cursor-help">
                          <span>{region.updatedAt ? new Date(region.updatedAt).toLocaleDateString() : 'N/A'}</span>
                          {region.updatedAt && (
                            <span className="invisible group-hover:visible absolute left-0 -bottom-6 bg-gray-800 text-white text-xs rounded py-1 px-2">
                              {new Date(region.updatedAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        {region.updatedBy && (
                          <div className="text-xs text-gray-400">
                            by {region.updatedBy}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/dashboard/regions/${region.id}`}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                          Edit
                        </Link>
                        {canDeleteRegions() && (
                          <button
                            onClick={() => handleDelete(region.id)}
                            className={`inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors ${deletingRegionId === region.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={deletingRegionId === region.id}
                          >
                            {deletingRegionId === region.id ? (
                              <ArrowPathIcon className="h-4 w-4 animate-spin" />
                            ) : (
                              <TrashIcon className="h-4 w-4" />
                            )}
                            {deletingRegionId === region.id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {regions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No regions found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Region Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Add New Region
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Region ID
                      </label>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="text"
                          value={newRegion.id}
                          onChange={(e) => setNewRegion(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          placeholder="Enter ID or generate"
                          required
                        />
                        <button
                          type="button"
                          onClick={generateId}
                          className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg"
                        >
                          Generate ID
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newRegion.name}
                        onChange={(e) => setNewRegion(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Enter region name"
                        required
                      />
                    </div>

                    {error && (
                      <div className="text-sm text-red-600">
                        {error}
                      </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg ${addingRegion ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={addingRegion}
                      >
                        {addingRegion ? 'Adding...' : 'Continue to Edit'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default Regions; 