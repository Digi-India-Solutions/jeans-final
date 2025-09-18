
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setIsDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  // Apply theme to document body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('darkMode', JSON.stringify(newTheme));
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isDarkMode={isDarkMode}
      />
      
      <div className="lg:ml-64">
        <TopBar 
          onMenuClick={toggleSidebar}
          isDarkMode={isDarkMode}
          onThemeToggle={toggleTheme}
        />
        
        <main className={`p-6 transition-colors duration-200 ${
          isDarkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}
