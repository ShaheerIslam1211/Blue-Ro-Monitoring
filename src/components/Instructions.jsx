import { Typography } from "@material-tailwind/react";
import { 
  BookOpenIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  GlobeAmericasIcon
} from "@heroicons/react/24/outline";

export function Instructions() {
  const sections = [
    {
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      title: "Super Admin Privileges",
      description: "As a Super Admin, you have full access to all system features and data across all clients and regions."
    },
    {
      icon: <UserGroupIcon className="h-6 w-6" />,
      title: "User Management",
      description: "Create, edit, and manage user accounts. Control access levels and permissions for all users in the system."
    },
    {
      icon: <BuildingOfficeIcon className="h-6 w-6" />,
      title: "Client Management",
      description: "Oversee all client organizations, their settings, and associated data. Add new clients or modify existing ones."
    },
    {
      icon: <GlobeAmericasIcon className="h-6 w-6" />,
      title: "Region Management",
      description: "Manage geographical regions and their specific settings. Control region-specific features and access."
    }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center gap-3 mb-6">
        <BookOpenIcon className="h-8 w-8 text-blue-500" />
        <Typography variant="h3">Admin Instructions</Typography>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-3 mb-2 text-blue-500">
              {section.icon}
              <Typography variant="h6">{section.title}</Typography>
            </div>
            <Typography className="text-gray-600">
              {section.description}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Instructions; 