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
import { getRoutes } from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import { userAtom } from "@/store/atoms/userAtom";
import { usersAtom } from "@/store/atoms/usersAtom";
import { userService } from "@/services/userService";
import { usersUnderMeService } from "@/services/usersUnderMeService";
import { clientsAtom } from "@/store/atoms/clientsAtom";
import { clientsService } from "@/services/clientsService";
import { regionsAtom } from "@/store/atoms/regionsAtom";
import { regionsService } from "@/services/regionsService";
import { plantsAtom } from "@/store/atoms/plantsAtom";
import { plantsService } from "@/services/plantsService";
import { RoleAlert } from "@/components/RoleAlert";
import { whoami } from "@/helper/whoami";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useAtom(userAtom);
  const [, setUsers] = useAtom(usersAtom);
  const [, setClients] = useAtom(clientsAtom);
  const [, setRegions] = useAtom(regionsAtom);
  const [, setPlants] = useAtom(plantsAtom);

  useEffect(() => {
    const loadUserData = async (id) => {
      try {
        const userData = await userService.getUserData(id);
        if (userData) {
          setUser({...userData, id});
          // Fetch users, clients, and regions
          const [usersData, clientsData, regionsData, plantsData] = await Promise.all([
            usersUnderMeService.getAllUsers(),
            clientsService.getAllClients(),
            regionsService.getAllRegions(),
            plantsService.getAllPlants()
          ]);
          setUsers(usersData);
          setClients(clientsData);
          setRegions(regionsData);
          setPlants(plantsData);
        } else {
          console.warn("No user data found in Firestore");
        }
      } catch (error) {
        console.error("Error loading data:", error);
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
        setUsers([]);
        setClients([]);
        setRegions([]);
        setPlants([]);
      }
    });

    return () => unsubscribe();
  }, [setUser, setUsers, setClients, setRegions, setPlants]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  const userRole = whoami();

  return (
    <div>

    <div className="min-h-screen bg-gray-50/50">
      <Sidenav
        routes={getRoutes()}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80">
      {<RoleAlert />}
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
          {getRoutes().map(
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
    </div>

  );
}

export default Dashboard;
