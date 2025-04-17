// src/app/components/CardWrapper.jsx
'use client';

import { useTheme } from "@/context/ThemeProvider";

const CardWrapper = ({ children, className = "" }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`relative rounded-lg shadow-md p-4 w-full sm:w-3/4 md:w-4/5 lg:w-4/5 xl:w-2/3 mx-auto border transition-transform duration-300 hover:scale-105 hover:shadow-lg  
        ${theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"} 
        ${className}`}
    >
      {children}
    </div>
  );
};

export default CardWrapper;
