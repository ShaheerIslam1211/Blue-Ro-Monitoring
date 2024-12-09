import React from "react";
import { useState } from "react";
import { useAtom } from 'jotai';
import { plantsAtom } from "@/store/atoms/plantsAtom";
import { plantsService } from "@/services/plantsService";
import {
  PhoneIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { BuildingStorefrontIcon } from "@heroicons/react/24/solid";
import { clientsAtom } from "@/store/atoms/clientsAtom";
import { regionsAtom } from "@/store/atoms/regionsAtom";
import { BuildingOfficeIcon, GlobeAmericasIcon } from "@heroicons/react/24/outline";

export function Plants() {
  const [plants, setPlants] = useAtom(plantsAtom);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newPlant, setNewPlant] = useState({
    id: '',
    name: '',
    clientId: '',
    regionId: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [addingPlant, setAddingPlant] = useState(false);
  const [deletingPlantId, setDeletingPlantId] = useState(null);
  const [clients] = useAtom(clientsAtom);
  const [regions] = useAtom(regionsAtom);

  const refreshPlants = async () => {
    setLoading(true);
    try {
      const fetchedPlants = await plantsService.getAllPlants();
      setPlants(fetchedPlants);
    } catch (error) {
      console.error("Error fetching plants:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateId = async () => {
    try {
      const id = await plantsService.generateUniqueId();
      setNewPlant(prev => ({ ...prev, id }));
    } catch (error) {
      setError('Error generating ID');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAddingPlant(true);
    try {
      await plantsService.createPlant(newPlant);
      setPlants((prevPlants) => [...prevPlants, newPlant]);
      setIsOpen(false);
      navigate(`/dashboard/plants/${newPlant.id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setAddingPlant(false);
    }
  };

  const handleDelete = async (plantId) => {
    if (window.confirm('Are you sure you want to delete this plant?')) {
      setDeletingPlantId(plantId);
      try {
        await plantsService.deletePlant(plantId);
        setPlants((prevPlants) => prevPlants.filter(plant => plant.id !== plantId));
      } catch (error) {
        console.error('Error deleting plant:', error);
      } finally {
        setDeletingPlantId(null);
      }
    }
  };

  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Plants Management</h1>
          <div className="flex gap-2">
            <button
              onClick={refreshPlants}
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <PlusIcon className="h-4 w-4" />
              Add Plant
            </button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plants.map((plant) => (
                  <tr key={plant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{plant.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">{plant.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">{plant.email || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <span className="text-sm text-gray-600 truncate block overflow-hidden">
                        {plant.notes || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        <div className="group relative cursor-help">
                          <span>{plant.updatedAt ? new Date(plant.updatedAt).toLocaleDateString() : 'N/A'}</span>
                          {plant.updatedAt && (
                            <span className="invisible group-hover:visible absolute left-0 -bottom-6 bg-gray-800 text-white text-xs rounded py-1 px-2">
                              {new Date(plant.updatedAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        {plant.updatedBy && (
                          <div className="text-xs text-gray-400">
                            by {plant.updatedBy}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/dashboard/plants/${plant.id}`}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(plant.id)}
                          className={`inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors ${deletingPlantId === plant.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={deletingPlantId === plant.id}
                        >
                          {deletingPlantId === plant.id ? (
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                          {deletingPlantId === plant.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {plants.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No plants found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Plant Modal */}
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
                    Add New Plant
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Plant ID
                      </label>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="text"
                          value={newPlant.id}
                          onChange={(e) => setNewPlant(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
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
                        value={newPlant.name}
                        onChange={(e) => setNewPlant(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Enter plant name"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Client
                        </label>
                        <select
                          value={newPlant.clientId}
                          onChange={(e) => setNewPlant(prev => ({ ...prev, clientId: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                          <option value="">Select Client (Optional)</option>
                          {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Region
                        </label>
                        <select
                          value={newPlant.regionId}
                          onChange={(e) => setNewPlant(prev => ({ ...prev, regionId: e.target.value }))}
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                          <option value="">Select Region (Optional)</option>
                          {regions.map((region) => (
                            <option key={region.id} value={region.id}>
                              {region.name}
                            </option>
                          ))}
                        </select>
                      </div>
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
                        className={`px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg ${addingPlant ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={addingPlant}
                      >
                        {addingPlant ? 'Adding...' : 'Continue to Edit'}
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
