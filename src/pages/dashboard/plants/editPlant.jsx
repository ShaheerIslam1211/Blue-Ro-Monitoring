// Similar to editClient.jsx but for plants
// You'll need to create this file with the same structure but plant-specific fields

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { plantsService } from '@/services/plantsService';
import {
  PhoneIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  GlobeAmericasIcon,
} from '@heroicons/react/24/outline';
import { useAtom } from 'jotai';
import { plantsAtom } from '@/store/atoms/plantsAtom';
import { BuildingStorefrontIcon } from '@heroicons/react/24/solid';
import { clientsAtom } from '@/store/atoms/clientsAtom';
import { regionsAtom } from '@/store/atoms/regionsAtom';
import { SelectSearch } from '@/components/SelectSearch';

const tabs = [
  { id: 'details', name: 'Plant Details', icon: BuildingStorefrontIcon },
  { id: 'connect', name: 'Connections', icon: BuildingOfficeIcon },
];

export function EditPlant() {
  const { plantId } = useParams();
  const [plants, setPlants] = useAtom(plantsAtom);
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [errors, setErrors] = useState({});
  const [clients] = useAtom(clientsAtom);
  const [regions] = useAtom(regionsAtom);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    notes: '',
    phone: '',
    email: '',
    clientId: '',
    regionId: '',
  });

  useEffect(() => {
    fetchPlantData();
  }, [plantId]);

  const fetchPlantData = async () => {
    try {
      const plantData = await plantsService.getPlant(plantId);
      if (plantData) {
        setFormData({
          name: plantData.name || '',
          capacity: plantData.capacity || '',
          status: plantData.status || '',
          // runningHours: plantData.runningHours || '',
          notes: plantData.notes || '',
          phone: plantData.phone || '',
          email: plantData.email || '',
          clientId: plantData.clientId || '',
          regionId: plantData.regionId || '',
        });
      }
    } catch (error) {
      console.error('Error fetching plant:', error);
      setMessage({ text: 'Error loading plant data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (value.length < 2) return 'Name must be at least 2 characters';
        if (value.length > 100) return 'Name must be less than 100 characters';
        return '';
      case 'capacity':
        if (isNaN(value) || Number(value) < 0)
          return 'Capacity must be a positive number';
        return '';
      case 'status':
        if (!['Running', 'Offline'].includes(value))
          return 'Status must be Running or Offline';
        return '';
      // case 'runningHours':
      //   if (isNaN(value) || Number(value) < 0)
      //     return 'Running Hours must be a positive number';
      //   return '';
      case 'phone':
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(value.replace(/[\s()-]/g, ''))) {
          return 'Please enter a valid phone number';
        }
        return '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';
      case 'notes':
        if (value.length > 500) return 'Notes must be less than 500 characters';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      await plantsService.updatePlant(plantId, formData);
      setPlants(
        plants.map((plant) =>
          plant.id === plantId ? { ...plant, ...formData } : plant
        )
      );
      setMessage({ text: 'Plant updated successfully!', type: 'success' });
      setErrors({});
    } catch (error) {
      setMessage({
        text: 'Error updating plant. Please try again.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4">
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard/plants')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Plants
        </button>
        <h2 className="text-2xl font-medium text-gray-800">Edit Plant</h2>
      </div>

      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'details' ? (
              <>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <BuildingStorefrontIcon className="h-5 w-5 text-gray-400" />
                    Plant Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.name ? 'border-red-300' : 'border-gray-200'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2">
                    Plant Capacity (MW)
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.capacity ? 'border-red-300' : 'border-gray-200'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.capacity && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.capacity}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.status ? 'border-red-300' : 'border-gray-200'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">Select Status</option>
                    <option value="Running">Running</option>
                    <option value="Offline">Offline</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-500">{errors.status}</p>
                  )}
                </div>
                {/* <div>
                  <label className="text-sm font-medium text-gray-700 mb-2">
                    Running Hours
                  </label>
                  <input
                    type="number"
                    name="runningHours"
                    value={formData.runningHours}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.runningHours ? 'border-red-300' : 'border-gray-200'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.runningHours && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.runningHours}
                    </p>
                  )}
                </div> */}

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.phone ? 'border-red-300' : 'border-gray-200'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-300' : 'border-gray-200'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <PencilSquareIcon className="h-5 w-5 text-gray-400" />
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.notes ? 'border-red-300' : 'border-gray-200'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.notes && (
                    <p className="mt-1 text-sm text-red-500">{errors.notes}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                    Client Name
                  </label>
                  <SelectSearch
                    options={clients.map((client) => ({
                      id: client.id,
                      name: client.name,
                    }))}
                    value={formData.clientId}
                    onChange={(value) =>
                      handleChange({ target: { name: 'clientId', value } })
                    }
                    displayValue={
                      clients.find((c) => c.id === formData.clientId)?.name
                    }
                    placeholder="Search clients..."
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <GlobeAmericasIcon className="h-5 w-5 text-gray-400" />
                    Plant Region
                  </label>
                  <SelectSearch
                    options={regions.map((region) => ({
                      id: region.id,
                      name: region.name,
                    }))}
                    value={formData.regionId}
                    onChange={(value) =>
                      handleChange({ target: { name: 'regionId', value } })
                    }
                    displayValue={
                      regions.find((r) => r.id === formData.regionId)?.name
                    }
                    placeholder="Search regions..."
                  />
                </div>
              </div>
            )}

            {message.text && (
              <div
                className={`flex items-center gap-2 p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <XCircleIcon className="h-5 w-5" />
                )}
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${
                saving ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {saving ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
