import React from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ isDarkMode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 z-40 group"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 w-5 h-5 transition-all duration-200 ${
            isDarkMode ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
          }`} 
        />
        <Moon 
          className={`absolute inset-0 w-5 h-5 transition-all duration-200 ${
            isDarkMode ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
          }`} 
        />
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 right-0 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </div>
    </button>
  );
};

export default ThemeToggle;
