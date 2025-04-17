// src/app/components/ThemedToaster.jsx
'use client';

import { Toaster } from 'react-hot-toast';
import { useTheme } from '@/context/ThemeProvider';

const ThemedToaster = () => {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: '8px',
          background: theme === 'dark' ? '#333' : '#fff',
          color: theme === 'dark' ? '#fff' : '#333',
        },
      }}
    />
  );
};

export default ThemedToaster;
