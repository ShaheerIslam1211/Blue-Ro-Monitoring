import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';
import {
  XMarkIcon,
  ChevronDownIcon,
  BuildingStorefrontIcon,
  GlobeAmericasIcon,
} from '@heroicons/react/24/solid';
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from '@material-tailwind/react';
import { Menu, Transition } from '@headlessui/react';
import { useMaterialTailwindController, setOpenSidenav } from '@/context';
import { userAtom } from '@/store/atoms/userAtom';
import { useAtom } from 'jotai';

export function Sidenav({ brandImg, brandName, routes }) {
  const [user] = useAtom(userAtom);
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const [plantsDropdownOpen, setPlantsDropdownOpen] = useState(false);
  const sidenavTypes = {
    dark: 'bg-gradient-to-br from-gray-800 to-gray-900',
    white: 'bg-white shadow-sm',
    transparent: 'bg-transparent',
  };

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? 'translate-x-0' : '-translate-x-80'
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
    >
      <div className={`relative`}>
        <Link to="/" className="py-6 px-8 text-center">
          <Typography
            variant="h6"
            color={sidenavType === 'dark' ? 'white' : 'blue-gray'}
          >
            {brandName}
          </Typography>
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-black" />
        </IconButton>
      </div>
      <div className="m-4">
        {routes
          .filter((route) => route.showInNav !== false)
          .map(({ layout, title, pages }, key) => (
            <ul key={key} className="mb-4 flex flex-col gap-1">
              {title && (
                <li className="mx-3.5 mt-4 mb-2">
                  <Typography
                    variant="small"
                    color={sidenavType === 'dark' ? 'white' : 'blue-gray'}
                    className="font-black uppercase opacity-75"
                  >
                    {title}
                  </Typography>
                </li>
              )}
              {pages
                .filter((page) => page.showInNav !== false)
                .map(({ icon, name, path }) => {
                  if (name === 'plants') {
                    // Plants dropdown in the navbar
                    return (
                      <li key={name}>
                        <button
                          onClick={() =>
                            setPlantsDropdownOpen(!plantsDropdownOpen)
                          }
                          className="flex items-center justify-between w-full px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            {icon}
                            <Typography color="inherit" className="font-medium">
                              Plants
                            </Typography>
                          </div>
                          <ChevronDownIcon
                            className={`w-5 h-5 transition-transform ${
                              plantsDropdownOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {plantsDropdownOpen && (
                          <ul className="ml-6 mt-2 space-y-1">
                            <li>
                              <NavLink
                                to="/dashboard/plants/data-sheet"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg"
                              >
                                <BuildingStorefrontIcon className="h-5 w-5" />
                                Data Sheet
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                to="/dashboard/plants/map-view"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg"
                              >
                                <GlobeAmericasIcon className="h-5 w-5" />
                                Map View
                              </NavLink>
                            </li>
                          </ul>
                        )}
                      </li>
                    );
                  }
                  return (
                    <li key={name}>
                      <NavLink to={`/${layout}${path}`}>
                        {({ isActive }) => (
                          <Button
                            variant={isActive ? 'gradient' : 'text'}
                            color={
                              isActive
                                ? sidenavColor
                                : sidenavType === 'dark'
                                ? 'white'
                                : 'blue-gray'
                            }
                            className="flex items-center gap-4 px-4 capitalize"
                            fullWidth
                          >
                            {icon}
                            <Typography
                              color="inherit"
                              className="font-medium capitalize"
                            >
                              {name === '{me}' ? user?.name + ' (Me)' : name}
                            </Typography>
                          </Button>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
            </ul>
          ))}
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: '/img/logo-ct.png',
  brandName: 'Blue Tech- RO Plant Monitoring',
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = '/src/widgets/layout/sidnave.jsx';

export default Sidenav;
