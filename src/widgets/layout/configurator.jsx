import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Button,
  IconButton,
  Switch,
  Typography,
} from "@material-tailwind/react";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setSidenavColor,
  setSidenavType,
  setFixedNavbar,
} from "@/context";

export function Configurator() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openConfigurator, sidenavColor, sidenavType, fixedNavbar } = controller;

  React.useEffect(() => {
    const savedSettings = localStorage.getItem('dashboardSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSidenavColor(dispatch, settings.sidenavColor);
      setSidenavType(dispatch, settings.sidenavType);
      setFixedNavbar(dispatch, settings.fixedNavbar);
    }
  }, [dispatch]);

  const saveSettings = (type, value) => {
    const settings = {
      sidenavColor,
      sidenavType,
      fixedNavbar,
      [type]: value,
    };
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
  };

  const sidenavColors = {
    white: "from-gray-100 to-gray-100 border-gray-200",
    dark: "from-black to-black border-gray-200",
    green: "from-green-400 to-green-600",
    blue: "from-blue-400 to-blue-600",
    red: "from-red-400 to-red-600",
  };

  const handleSidenavColor = (color) => {
    setSidenavColor(dispatch, color);
    saveSettings('sidenavColor', color);
  };

  const handleSidenavType = (type) => {
    setSidenavType(dispatch, type);
    saveSettings('sidenavType', type);
  };

  const handleFixedNavbar = (fixed) => {
    setFixedNavbar(dispatch, fixed);
    saveSettings('fixedNavbar', fixed);
  };

  return (
    <aside
      className={`fixed top-0 right-0 z-50 h-screen w-96 bg-white px-2.5 shadow-lg transition-transform duration-300 ${
        openConfigurator ? "translate-x-0" : "translate-x-96"
      }`}
    >
      <div className="flex items-start justify-between px-6 pt-8 pb-6">
        <div>
          <Typography variant="h5" color="blue-gray">
            Dashboard Settings
          </Typography>
          <Typography className="font-normal text-blue-gray-600">
            Customize your dashboard appearance.
          </Typography>
        </div>
        <IconButton
          variant="text"
          color="blue-gray"
          onClick={() => setOpenConfigurator(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
        </IconButton>
      </div>
      <div className="py-4 px-6">
        <div className="mb-12">
          <Typography variant="h6" color="blue-gray">
            Sidenav Colors
          </Typography>
          <div className="mt-3 flex items-center gap-2">
            {Object.keys(sidenavColors).map((color) => (
              <span
                key={color}
                className={`h-6 w-6 cursor-pointer rounded-full border bg-gradient-to-br transition-transform hover:scale-105 ${
                  sidenavColors[color]
                } ${
                  sidenavColor === color ? "border-black" : "border-transparent"
                }`}
                onClick={() => handleSidenavColor(color)}
              />
            ))}
          </div>
        </div>
        <div className="mb-12">
          <Typography variant="h6" color="blue-gray">
            Sidenav Type
          </Typography>
          <Typography variant="small" color="gray">
            Choose between different sidenav types.
          </Typography>
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant={sidenavType === "dark" ? "gradient" : "outlined"}
              onClick={() => handleSidenavType("dark")}
            >
              Dark
            </Button>
            <Button
              variant={sidenavType === "transparent" ? "gradient" : "outlined"}
              onClick={() => handleSidenavType("transparent")}
            >
              Transparent
            </Button>
            <Button
              variant={sidenavType === "white" ? "gradient" : "outlined"}
              onClick={() => handleSidenavType("white")}
            >
              White
            </Button>
          </div>
        </div>
        <div className="mb-12">
          <hr />
          <div className="flex items-center justify-between py-5">
            <Typography variant="h6" color="blue-gray">
              Navbar Fixed
            </Typography>
            <Switch
              id="navbar-fixed"
              value={fixedNavbar}
              checked={fixedNavbar}
              onChange={() => handleFixedNavbar(!fixedNavbar)}
            />
          </div>
          <hr />
        </div>
      
        <div className="text-center">
          <Typography variant="h6" color="blue-gray">
            Need Help?
          </Typography>
          <Typography variant="small" color="gray" className="mt-2">
            Contact us at{" "}
            <a
              href="https://cuthours.com"
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 transition-colors hover:text-blue-700"
            >
              cuthours.com
            </a>
          </Typography>
        </div>
      </div>
    </aside>
  );
}

export default Configurator;