import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersUnderMeService } from '@/services/usersUnderMeService';
import {
  UserCircleIcon,
  PhoneIcon,
  PencilSquareIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  GlobeAmericasIcon,
  KeyIcon,
  UserGroupIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { useAtom } from 'jotai';
import { usersAtom } from '@/store/atoms/usersAtom';
import { ClientsTab } from './ClientsTab';
import { RegionsTab } from './RegionsTab';
import { Tab } from '@headlessui/react';
import { Country, State, City } from 'country-state-city';
import { InstructionsCard } from '@/components/InstructionsCard';
import ReadWriteControl from './ReadWriteControl';

const tabs = [
  { id: 'personal', name: 'Personal Details', icon: UserCircleIcon },
  { id: 'adminOptions', name: 'Access Control', icon: UserGroupIcon },
  { id: 'permissions', name: 'System Permissions', icon: KeyIcon },
];

export function EditUser() {
  const { userId } = useParams();
  const [users, setUsers] = useAtom(usersAtom);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    zipcode: '',
    country: '',
    state: '',
    city: '',
    notes: '',
    receive_notification: false,
  });

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const loadCountries = async () => {
      const countryList = Country.getAllCountries();
      setCountries(countryList);
    };
    loadCountries();
  }, []);

  useEffect(() => {
    if (formData.country) {
      const selectedCountry = countries.find(
        (country) => country.name === formData.country
      );
      if (selectedCountry) {
        const statesList = State.getStatesOfCountry(selectedCountry.isoCode);
        setStates(statesList);
        setCities([]);
      }
    } else {
      setStates([]);
      setCities([]);
    }
  }, [formData.country, countries]);

  useEffect(() => {
    if (formData.state) {
      const selectedState = states.find(
        (state) => state.name === formData.state
      );
      if (selectedState) {
        const citiesList = City.getCitiesOfState(
          selectedState.countryCode,
          selectedState.isoCode
        );
        setCities(citiesList);
      }
    } else {
      setCities([]);
    }
  }, [formData.state, states]);

  const fetchUserData = async () => {
    try {
      const userData = await usersUnderMeService.getUser(userId);
      if (userData) {
        setFormData({
          name: userData.name || '',
          phone: userData.phone || '',
          email: userData.email || '',
          address: userData.address || '',
          zipcode: userData.zipcode || '',
          country: userData.country || '',
          state: userData.state || '',
          city: userData.city || '',
          notes: userData.notes || '',
          receive_notification: userData.receive_notification || false,
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setMessage({ text: 'Error loading user data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (value.length < 2) return 'Name must be at least 2 characters';
        if (value.length > 50) return 'Name must be less than 50 characters';
        return '';
      case 'phone':
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(value.replace(/[\s()-]/g, ''))) {
          return 'Please enter a valid phone number';
        }
        return '';
      case 'zipcode':
        if (!/^\d{5,10}$/.test(value)) return 'Please enter a valid Zip Code';
        return '';
      case 'notes':
        if (value.length > 500) return 'Notes must be less than 500 characters';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (type !== 'checkbox') {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== 'receive_notification' && formData[key]) {
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
      await usersUnderMeService.updateUser(userId, formData);
      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, ...formData, updatedAt: new Date().toISOString() }
            : user
        )
      );
      setMessage({ text: 'User updated successfully!', type: 'success' });
      setErrors({});
    } catch (error) {
      setMessage({
        text: 'Error updating user. Please try again.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const adminInstructions = [
    {
      text: 'Access permissions are hierarchical - Write access automatically includes Read access.',
    },
    {
      text: 'Client Access: Granting access to a client allows the user to view/modify all plants associated with that client organization.',
    },
    {
      text: 'Region Access: Granting access to a region allows the user to view/modify all plants within that geographical region.',
    },
    {
      text: '⚠️ Important: Users typically should have either Client OR Region access, not both. Having both types of access is uncommon and should be carefully considered.',
    },
    {
      text: "Review permissions periodically to ensure they align with the user's current responsibilities.",
    },
  ];

  const permissionInstructions = [
    {
      text: 'Read permissions allow users to view data within each module.',
    },
    {
      text: 'Write permissions allow users to modify existing records.',
    },
    {
      text: 'Create permissions allow users to add new records.',
    },
    {
      text: 'Delete permissions allow users to remove existing records.',
    },
    {
      text: "⚠️ Important: Grant permissions based on the principle of least privilege - only give access that is necessary for the user's role.",
    },
    {
      text: 'Changes to permissions take effect immediately after saving.',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4">
      {/* Back Button & Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard/users')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Users
        </button>
        <h2 className="text-2xl font-medium text-gray-800">Edit User</h2>
        <div className="mt-6 border-b border-gray-200">
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
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {activeTab === 'personal' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form fields from your existing code */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <UserCircleIcon className="h-5 w-5 text-gray-400" />
                Name
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

            {/* Email (Read-Only) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                Email (Read-Only)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>

            {/* Address Input*/}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <PencilSquareIcon className="h-5 w-5 text-gray-400" />
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>

            {/* Country Dropdown */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <GlobeAmericasIcon className="h-5 w-5 text-gray-400" />
                Country
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={(e) => {
                  handleChange(e);
                  setFormData((prev) => ({ ...prev, state: '', city: '' }));
                }}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.isoCode} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* State Dropdown */}
            {formData.country && states.length > 0 && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <GlobeAmericasIcon className="h-5 w-5 text-gray-400" />
                  State
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={(e) => {
                    handleChange(e);
                    setFormData((prev) => ({ ...prev, city: '' }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.isoCode} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* City Dropdown */}
            {formData.state && cities.length > 0 && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <GlobeAmericasIcon className="h-5 w-5 text-gray-400" />
                  City
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Zip Code Input*/}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <PencilSquareIcon className="h-5 w-5 text-gray-400" />
                Zip Code
              </label>
              <input
                type="text"
                name="zipcode"
                value={formData.zipcode}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border  ${
                  errors.zipcode ? 'border-red-300' : 'border-gray-200'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {errors.zipcode && (
                <p className="mt-1 text-sm text-red-500">{errors.zipcode}</p>
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

            <div className="flex items-center justify-between py-4 px-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <BellIcon className="h-6 w-6 text-gray-400" />
                <div>
                  <h3 className="text-sm font-medium text-gray-700">
                    Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive updates and alerts
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="receive_notification"
                  checked={formData.receive_notification}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

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
        {activeTab === 'adminOptions' && (
          <div className="space-y-6">
            <InstructionsCard instructions={adminInstructions} />
            <Tab.Group>
              <div className="border-b border-gray-200">
                <Tab.List className="flex -mb-px space-x-8">
                  <Tab
                    className={({ selected }) =>
                      `group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm outline-none
                    ${
                      selected
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <BuildingOfficeIcon
                          className={`mr-2 h-5 w-5 ${
                            selected
                              ? 'text-blue-500'
                              : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                        />
                        <span>Client Access Management</span>
                      </>
                    )}
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm outline-none
                    ${
                      selected
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <GlobeAmericasIcon
                          className={`mr-2 h-5 w-5 ${
                            selected
                              ? 'text-blue-500'
                              : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                        />
                        <span>Region Access Management</span>
                      </>
                    )}
                  </Tab>
                </Tab.List>
              </div>
              <Tab.Panels>
                <Tab.Panel>
                  <div className="bg-white rounded-lg">
                    <div className="px-1 py-4">
                      <ClientsTab userId={userId} />
                    </div>
                  </div>
                </Tab.Panel>
                <Tab.Panel>
                  <div className="bg-white rounded-lg">
                    <div className="px-1 py-4">
                      <RegionsTab userId={userId} />
                    </div>
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        )}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <InstructionsCard instructions={permissionInstructions} />
            <ReadWriteControl id={userId} />
          </div>
        )}
      </div>
    </div>
  );
}

export default EditUser;
