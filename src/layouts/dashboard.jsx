import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton, Spinner } from "@material-tailwind/react";
import { useAtom } from 'jotai';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import { userAtom } from "@/store/atoms/userAtom";
import { usersAtom } from "@/store/atoms/usersAtom";
import { userService } from "@/services/userService";
import { usersUnderMeService } from "@/services/usersUnderMeService";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useAtom(userAtom);
  const [, setUsers] = useAtom(usersAtom);

  useEffect(() => {
    const loadUserData = async (uid) => {
      try {
        const userData = await userService.getUserData(uid);
        if (userData) {
          setUser({...userData, uid});
          // After loading user data, fetch users under them
          const usersData = await usersUnderMeService.getAllUsers();
          setUsers(usersData);
        } else {
          console.warn("No user data found in Firestore");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadUserData(user.uid);
      } else {
        setLoading(false);
        setUser(null);
        setUsers([]); // Clear users when logged out
      }
    });

    return () => unsubscribe();
  }, [setUser, setUsers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />
        <Configurator />
        <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton>
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} />
              ))
          )}
        </Routes>
        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
