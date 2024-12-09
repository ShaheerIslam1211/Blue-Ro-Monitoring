import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export function NotFound({ 
  title = "Access Denied", 
  message = "You don't have permission to access this resource.", 
  linkText = "Go Back",
  linkTo = "/dashboard"
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-gray-500">{message}</p>
        </div>
        <Link
          to={linkTo}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
        >
          {linkText}
        </Link>
      </div>
    </div>
  );
}

export default NotFound; 