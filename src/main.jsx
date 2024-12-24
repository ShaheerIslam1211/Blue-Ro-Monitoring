/**
=========================================================
* Material Tailwind Dashboard React - v2.1.0
=========================================================
* Copyright 2025 cuthours.com (https://www.cuthours.com)
* Coded by (Muhammad Wasil & Muhammad Shaheer Islam)
=========================================================
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-tailwind/react';
import { MaterialTailwindControllerProvider } from '@/context';
import '../public/css/tailwind.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <MaterialTailwindControllerProvider>
          <App />
        </MaterialTailwindControllerProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
