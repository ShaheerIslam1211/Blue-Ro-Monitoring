import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Navbar as MTNavbar, Typography } from '@material-tailwind/react';

export function Navbar({ routes }) {
  const navList = (
    <ul className="mb-4 mt-2 flex flex-row items-center gap-2">
      {routes.map(({ name, path, icon }) => (
        <Typography
          key={name}
          as="li"
          variant="small"
          color="blue-gray"
          className="capitalize"
        >
          <Link to={path} className="flex items-center gap-1 p-1 font-normal">
            {icon &&
              React.createElement(icon, {
                className: 'w-[18px] h-[18px] opacity-50 mr-1',
              })}
            {name}
          </Link>
        </Typography>
      ))}
    </ul>
  );

  return (
    <MTNavbar className="p-3">
      <div className="container mx-auto">{navList}</div>
    </MTNavbar>
  );
}

Navbar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Navbar.displayName = '/src/widgets/layout/navbar.jsx';

export default Navbar;
