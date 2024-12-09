import { useState, useEffect } from 'react';
import { 
  ShieldExclamationIcon, 
  XMarkIcon, 
  EyeIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon,
  GlobeAmericasIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import { whoami } from '@/helper/whoami';
import { Link, useNavigate } from 'react-router-dom';
import { getActiveTime, auth } from '@/firebase/firebase';

export function RoleAlert() {
  const [isVisible, setIsVisible] = useState(true);
  const [activeTime, setActiveTime] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userRole = whoami();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialActiveTime = async () => {
      const time = await getActiveTime();
      setActiveTime(time);
    };

    fetchInitialActiveTime();
    const timer = setInterval(() => {
      setActiveTime(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  if (!isVisible || userRole !== "super_admin") return null;

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const quickLinks = [
    { icon: <UserGroupIcon className="h-4 w-4" />, label: "Users", path: "/dashboard/users" },
    { icon: <BuildingOfficeIcon className="h-4 w-4" />, label: "Clients", path: "/dashboard/clients" },
    { icon: <GlobeAmericasIcon className="h-4 w-4" />, label: "Regions", path: "/dashboard/regions" },
    { icon: <QuestionMarkCircleIcon className="h-4 w-4" />, label: "Instructions", path: "/dashboard/instructions" },
  ];

  const handleLogout = () => {
    auth.signOut();
    navigate("/auth/sign-in");
    window.location.reload();
    setIsVisible(false);
  };

  return (
    <div className="mb-6 space-y-2">
      {/* Warning Alert */}
      <div className="flex items-center justify-between bg-amber-50 px-4 py-2.5 rounded-lg border border-amber-200">
        <div className="flex items-center gap-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
          <p className="text-sm text-amber-800">
            <strong className="font-medium">Proceed with care:</strong> Your actions can affect the entire system. Ensure you understand the impact of your changes.
          </p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-amber-500 hover:text-amber-700"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Main Admin Panel */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-lg border border-blue-200 shadow-md">
        <div className="flex items-center gap-x-4">
          {/* Left side with icon and title */}
          <div className="flex items-center gap-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 shadow-inner">
              <ShieldExclamationIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">Super Admin Mode</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                >
                  Active for {formatTime(activeTime)}
                </button>
              </div>
              <div className="flex items-center gap-x-1.5 text-xs text-gray-600">
                <EyeIcon className="h-3.5 w-3.5 text-blue-500" />
                <span>Full Access</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="hidden sm:flex items-center gap-3 ml-4">
            <div className="h-4 w-px bg-gray-300" />
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="flex items-center gap-x-1.5 px-2 py-1 rounded-md hover:bg-blue-100/70 text-sm text-gray-600 hover:text-blue-700 transition-colors"
              >
                <span className="text-blue-500">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Modal for Session Details */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-medium text-gray-900">Session Details</h3>
            <p className="mt-2 text-sm text-gray-600">
              Your session has been active for {formatTime(activeTime)}.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 inline-block mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleAlert; 