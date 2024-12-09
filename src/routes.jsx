import {
  HomeIcon,
  UserCircleIcon,
  InformationCircleIcon,
  ServerStackIcon,
  UsersIcon,
  BuildingOfficeIcon,
  GlobeAmericasIcon,
  BuildingStorefrontIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Notifications } from "@/pages/dashboard";
import { Users } from "@/pages/dashboard/users";
import { Clients } from "@/pages/dashboard/clients";
import { Regions } from "@/pages/dashboard/regions";
import { SignIn, SignUp } from "@/pages/auth";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { EditUser } from "@/pages/dashboard/users/editUser";
import { EditClient } from "@/pages/dashboard/clients/editClient";
import { EditRegion } from "@/pages/dashboard/regions/editRegion";
import { Plants } from "@/pages/dashboard/plants";
import { EditPlant } from "@/pages/dashboard/plants/editPlant";
import { Instructions } from "@/components/Instructions";

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* Replace with your preferred loading component */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!authUser) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  return children;
};

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <ProtectedRoute><Notifications /></ProtectedRoute>,
        showInNav: true,
      },
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <ProtectedRoute><Home /></ProtectedRoute>,
        showInNav: true,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "{me}",
        path: "/profile",
        element: <ProtectedRoute><Profile /></ProtectedRoute>,
        showInNav: true,
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "users",
        path: "/users",
        element: <ProtectedRoute><Users /></ProtectedRoute>,
        showInNav: true,
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "edit user",
        path: "/users/:userId",
        element: <ProtectedRoute><EditUser /></ProtectedRoute>,
        showInNav: false,
      },
      {
        icon: <BuildingOfficeIcon {...icon} />,
        name: "clients",
        path: "/clients",
        element: <ProtectedRoute><Clients /></ProtectedRoute>,
        showInNav: true,
      },
      {
        icon: <BuildingOfficeIcon {...icon} />,
        name: "edit client",
        path: "/clients/:clientId",
        element: <ProtectedRoute><EditClient /></ProtectedRoute>,
        showInNav: false,
      },
      {
        icon: <GlobeAmericasIcon {...icon} />,
        name: "regions",
        path: "/regions",
        element: <ProtectedRoute><Regions /></ProtectedRoute>,
        showInNav: true,
      },
      {
        icon: <GlobeAmericasIcon {...icon} />,
        name: "edit region",
        path: "/regions/:regionId",
        element: <ProtectedRoute><EditRegion /></ProtectedRoute>,
        showInNav: false,
      },
      {
        icon: <BuildingStorefrontIcon {...icon} />,
        name: "plants",
        path: "/plants",
        element: <ProtectedRoute><Plants /></ProtectedRoute>,
        showInNav: true,
      },
      {
        icon: <BuildingStorefrontIcon {...icon} />,
        name: "edit plant",
        path: "/plants/:plantId",
        element: <ProtectedRoute><EditPlant /></ProtectedRoute>,
        showInNav: false,
      },
      {
        icon: <QuestionMarkCircleIcon {...icon} />,
        name: "instructions",
        path: "/instructions",
        element: <ProtectedRoute><Instructions /></ProtectedRoute>,
        showInNav: true,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    showInNav: false,
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
        showInNav: false,
      },
    ],
  },
];

export default routes;
