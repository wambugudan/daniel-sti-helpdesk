'use client'


import React from 'react';
import { useTheme } from '@/context/ThemeProvider';

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer
      className={`border-teal-50 text-center py-4 transition duration-300 ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-teal-50 text-gray-700'
      }`}
    >
      <p className='text-sm font-medium'>
        &copy; {new Date().getFullYear()} | STI Policy HelpDesk | All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;

