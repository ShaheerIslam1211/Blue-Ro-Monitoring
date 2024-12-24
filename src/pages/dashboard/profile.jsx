import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '@/store/atoms/userAtom';
import { userService } from '@/services/userService';
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import {
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  GlobeAmericasIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { Country, State, City } from 'country-state-city';

export function Profile() {
  const [user, setUser] = useAtom(userAtom);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
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
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) {
      setEmail(auth.currentUser.email || 'Email not available');
    }
  }, []);

  useEffect(() => {
    const loadCountries = async () => {
      const countryList = Country.getAllCountries();
      setCountries(countryList);
    };
    loadCountries();

    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        address: user.address || '',
        zipcode: user.zipcode || '',
        country: user.country || '',
        state: user.state || '',
        city: user.city || '',
        notes: user.notes || '',
        receive_notification: user.receive_notification || false,
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);

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

  const reauthenticateUser = async (email, oldPassword) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      const credential = EmailAuthProvider.credential(email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      console.log('Reauthentication successful.');
      return true;
    } catch (error) {
      console.error('Error during reauthentication:', error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect old password');
      }
      throw error;
    }
  };

  const updateUserPassword = async (newPassword) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      await updatePassword(user, newPassword);

      console.log('Password updated successfully.');
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
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
      case 'newPassword':
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      case 'confirmPassword':
        if (value !== formData.newPassword) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const removeUndefinedFields = (data) => {
    const cleanedData = {};
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== '') {
        cleanedData[key] = data[key];
      }
    }
    return cleanedData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Step 1: Check the provided password by end user
      if (formData.oldPassword) {
        await reauthenticateUser(email, formData.oldPassword);
      }

      // Step 2: Update the password if new password is provided
      if (formData.newPassword) {
        await updateUserPassword(formData.newPassword);
      }
      const updates = removeUndefinedFields({
        ...formData,
        oldPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined,
      });

      await userService.updateUserData(user.id, updates);

      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setFormData((prev) => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Error updating profile:', error);

      // Here you can handle old password error while updating in firebase
      if (error.message === 'Firebase: Error (auth/invalid-credential).') {
        setErrors((prev) => ({
          ...prev,
          oldPassword: 'Incorrect old password',
        }));
      } else {
        setMessage({
          text: 'Error updating profile. Please try again.',
          type: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium text-gray-800 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
              className="h-8 w-8 text-blue-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
            Profile Settings
          </h2>
          <p className="text-gray-500 mt-1 ml-10">
            Manage your account preferences
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="flex items-center gap-2">
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
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone Input */}
          <div>
            <label className="flex items-center gap-2">
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
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email (Read-Only) */}
          <div>
            <label className="flex items-center gap-2">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              Email (Read-Only)
            </label>
            <input
              type="email"
              name="email"
              value={email}
              readOnly
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none bg-gray-100"
            />
          </div>

          {/* Address Input*/}
          <div>
            <label className="flex items-center gap-2">
              <PencilSquareIcon className="h-5 w-5 text-gray-400" />
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
            />
          </div>

          {/* Notes Input*/}
          <div>
            <label className="flex items-center gap-2">
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
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none resize-none`}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.notes}
              </p>
            )}
          </div>

          {/* Country Dropdown */}
          <div>
            <label className="flex items-center gap-2">
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
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
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
              <label className="flex items-center gap-2">
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
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
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
              <label className="flex items-center gap-2">
                <GlobeAmericasIcon className="h-5 w-5 text-gray-400" />
                City
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
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
            <label className="flex items-center gap-2">
              <PencilSquareIcon className="h-5 w-5 text-gray-400" />
              Zip Code
            </label>
            <input
              type="text"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
            />
          </div>

          {/* Password Change Input*/}
          <div>
            <h3 className="flex items-center gap-2 font-medium">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
              Change Password
            </h3>
            <label className="flex items-center gap-2">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
              Old Password
            </label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.oldPassword ? 'border-red-300' : 'border-gray-200'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
            />
            {errors.oldPassword && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.oldPassword}
              </p>
            )}
            {formData.oldPassword && (
              <>
                <label className="flex items-center gap-2 mt-4">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.newPassword ? 'border-red-300' : 'border-gray-200'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    {errors.newPassword}
                  </p>
                )}
                <label className="flex items-center gap-2 mt-4">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.confirmPassword
                      ? 'border-red-300'
                      : 'border-gray-200'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Notification Toggle */}
          <div className="flex items-center justify-between py-6 px-6 rounded-lg bg-gray-50">
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
                checked={formData.receive_notification}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    receive_notification: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          {/* Status Message */}
          {message.text && (
            <div
              className={`flex items-center gap-2 py-4 px-6 rounded-lg ${
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
