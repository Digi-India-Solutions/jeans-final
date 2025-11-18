import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ onMenuClick, isDarkMode, onThemeToggle }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: 'New order received', time: '2 min ago', type: 'order' },
    { id: 2, title: 'Low stock alert: Denim Jeans', time: '5 min ago', type: 'stock' },
    { id: 3, title: 'Payment confirmed', time: '10 min ago', type: 'payment' },
    { id: 4, title: 'Return request received', time: '15 min ago', type: 'return' }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
      if (!event.target.closest('.profile-dropdown')) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("login");
    navigate("/");
  };

  return (
    <header className={`border-b h-16 flex items-center justify-between px-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className={`lg:hidden p-2 rounded-md transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-700 text-gray-600'}`}
        >
          <i className="ri-menu-line text-xl"></i>
        </button>

        {/* Search */}
        {/* <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`ri-search-line text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}></i>
          </div>
          <input
            type="text"
            placeholder="Search products, orders, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 pr-4 py-2 w-80 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
          />
        </div> */}
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Theme toggle */}
        {/* <button
          onClick={onThemeToggle}
          className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
        >
          <i className={`${isDarkMode ? 'ri-sun-line' : 'ri-moon-line'} text-xl`}></i>
        </button> */}

        {/* Quick actions */}
        {/* <div className="hidden md:flex items-center space-x-2">
          <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
            <i className="ri-add-line mr-1"></i>
            Add Product
          </button>
          <button className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
            <i className="ri-file-text-line mr-1"></i>
            Create Invoice
          </button>
        </div> */}

        {/* Notifications */}
        <div className="relative notification-dropdown">
          {/* <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={'relative p-2 rounded-lg transition-colors'}
          >
            <i className="ri-notification-3-line text-xl"></i>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              4
            </span>
          </button> */}

          {showNotifications && (
            <div className={`absolute right-0 top-12 w-80 rounded-lg shadow-lg border z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-4 border-b hover:bg-opacity-50 ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                    }`}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'order' ? 'bg-blue-100' :
                        notification.type === 'stock' ? 'bg-red-100' :
                          notification.type === 'payment' ? 'bg-green-100' :
                            'bg-yellow-100'
                        }`}>
                        <i className={`${notification.type === 'order' ? 'ri-shopping-bag-line text-blue-600' :
                          notification.type === 'stock' ? 'ri-alert-line text-red-600' :
                            notification.type === 'payment' ? 'ri-money-dollar-circle-line text-green-600' :
                              'ri-exchange-line text-yellow-600'
                          } text-sm`}></i>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {notification.title}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative profile-dropdown">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className={'flex items-center space-x-2 p-2 rounded-lg transition-colors '}
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <i className={`ri-user-line ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}></i>
            </div>
            <span className={'hidden md:block text-sm font-medium '}>Admin</span>
            <i className={`ri-arrow-down-s-line text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
          </button>

          {showProfile && (
            <div className={`absolute right-0 top-12 w-48 rounded-lg shadow-lg border z-50 ${isDarkMode ? '' : 'bg-white border-gray-200'
              }`}>
              <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Admin User</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>admin@garments.com</p>
              </div>
              <div className="py-2">
                {/* <button className={'w-full text-left px-4 py-2 text-sm transition-colors hover:bg-opacity-50 flex items-center space-x-2 '}>
                  <i className="ri-user-settings-line"></i>
                  <span>Profile Settings</span>
                </button>
                <button className={'w-full text-left px-4 py-2 text-sm transition-colors hover:bg-opacity-50 flex items-center space-x-2 '}>
                  <i className="ri-settings-3-line"></i>
                  <span>System Settings</span>
                </button>
                <button className={'w-full text-left px-4 py-2 text-sm transition-colors hover:bg-opacity-50 flex items-center space-x-2 '}>
                  <i className="ri-question-line"></i>
                  <span>Help & Support</span>
                </button>
                <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} /> */}
                <button onClick={handleLogout} className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-2 ${isDarkMode ? 'text-red-400 hover:bg-red-900 hover:bg-opacity-20' : 'text-red-600 hover:bg-red-50'
                  }`}>
                  <i className="ri-logout-box-line"></i>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
