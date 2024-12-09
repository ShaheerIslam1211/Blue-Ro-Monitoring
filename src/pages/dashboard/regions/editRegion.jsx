import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { regionsService } from "@/services/regionsService";
import { NotFound } from "@/components/NotFound";
import { accessCheck } from "@/helper/accessCheck";
import {
  BuildingOfficeIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { useAtom } from 'jotai';
import { regionsAtom } from "@/store/atoms/regionsAtom";

const tabs = [
  { id: 'details', name: 'Region Details', icon: BuildingOfficeIcon },
];

export function EditRegion() {
  const { regionId } = useParams();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [regions, setRegions] = useAtom(regionsAtom);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    notes: '',
    phone: '',
    email: '',
  });
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const checkAccess = () => {
      const access = accessCheck(regionId, 'region');
      setHasAccess(access.write);
      setLoading(false);
    };
    
    checkAccess();
  }, [regionId]);

  useEffect(() => {
    fetchRegionData();
  }, [regionId]);

  const fetchRegionData = async () => {
    try {
      const regionData = await regionsService.getRegion(regionId);
      if (regionData) {
        setFormData({
          name: regionData.name || '',
          notes: regionData.notes || '',
          phone: regionData.phone || '',
          email: regionData.email || '',
        });
      }
    } catch (error) {
      console.error("Error fetching region:", error);
      setMessage({ text: 'Error loading region data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-8">
      <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
    </div>;
  }

  if (!hasAccess) {
    return <NotFound 
      title="Access Denied" 
      message="You don't have permission to edit this region."
      linkText="Back to Regions"
      linkTo="/dashboard/regions"
    />;
  }

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (value.length < 2) return 'Name must be at least 2 characters';
        if (value.length > 100) return 'Name must be less than 100 characters';
        return '';
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
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    Object.keys(formData).forEach(key => {
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
      await regionsService.updateRegion(regionId, formData);
      setRegions(regions.map(region => 
        region.id === regionId 
          ? { ...region, ...formData }
          : region
      ));
      setMessage({ text: 'Region updated successfully!', type: 'success' });
      setErrors({});
    } catch (error) {
      setMessage({ text: 'Error updating region. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4">
      {/* Back Button & Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard/regions')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Regions
        </button>
        <h2 className="text-2xl font-medium text-gray-800">Edit Region</h2>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
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

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                Region Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                Main Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                Main Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
                className={`w-full px-4 py-3 rounded-lg border ${errors.notes ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-500">{errors.notes}</p>
              )}
            </div>

            {message.text && (
              <div className={`flex items-center gap-2 p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
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

export default EditRegion; 