import { useState, useEffect } from "react";
import { useAtom } from 'jotai';
import { userAtom } from "@/store/atoms/userAtom";
import { userService } from "@/services/userService";
import {
  UserCircleIcon,
  PhoneIcon,
  PencilSquareIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export function Profile() {
  const [user, setUser] = useAtom(userAtom);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    notes: '',
    receive_notification: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        notes: user.notes || '',
        receive_notification: user.receive_notification || false
      });
    }
  }, [user]);

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
      if (key !== 'receive_notification' && formData[key]) {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await userService.updateUserData(user.id, formData);
      setUser({
        ...user,
        ...formData
      });
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setErrors({});
    } catch (error) {
      setMessage({ text: 'Error updating profile. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4">
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium text-gray-800 flex items-center gap-2">
            <UserCircleIcon className="h-8 w-8 text-blue-500" />
            Profile Settings
          </h2>
          <p className="text-gray-500 mt-1 ml-10">Manage your account preferences</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Name Input */}
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
              placeholder="John Doe"
              maxLength={50}
              className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
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
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (123) 456-7890"
              className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Notes Textarea */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <PencilSquareIcon className="h-5 w-5 text-gray-400" />
              Notes
              <span className="text-gray-400 text-xs ml-auto">
                {formData.notes.length}/500
              </span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes here..."
              rows="4"
              maxLength={500}
              className={`w-full px-4 py-3 rounded-lg border ${errors.notes ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none resize-none`}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <ExclamationCircleIcon className="h-4 w-4" />
                {errors.notes}
              </p>
            )}
          </div>

          {/* Notification Toggle */}
          <div className="flex items-center justify-between py-6 px-6 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <BellIcon className="h-6 w-6 text-gray-400" />
              <div>
                <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                <p className="text-sm text-gray-500">Receive updates and alerts</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.receive_notification}
                onChange={(e) => setFormData({
                  ...formData,
                  receive_notification: e.target.checked
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          {/* Status Message */}
          {message.text && (
            <div className={`flex items-center gap-2 py-4 px-6 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' 
                ? <CheckCircleIcon className="h-5 w-5" />
                : <XCircleIcon className="h-5 w-5" />
              }
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
