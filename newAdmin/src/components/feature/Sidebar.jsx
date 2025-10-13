// import { useEffect, useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { postData } from '../../services/FetchNodeServices';


// export default function Sidebar({ isOpen, onClose, isDarkMode }) {
//   const [expandedItems, setExpandedItems] = useState({ 1: true });
//   const [permiton, setPermiton] = useState('');
//   const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("JeansUser")));
//   const location = useLocation();
//   const navigate = useNavigate();



//   const menuItems = [
//     {
//       title: 'Dashboard',
//       icon: 'ri-dashboard-line',
//       path: '/admin/dashboard'
//     },
//     {
//       title: 'Application Management',
//       icon: 'ri-settings-3-line',
//       children: [
//        if(permiton?.banners?.read === true) {
//  { title: 'Banners', path: '/admin/application/banners' },
//        }
// if (permiton?.categories?.read === true) { { title: 'Categories', path: '/admin/application/categories' } },
// { title: 'Sub-Categories', path: '/admin/application/subcategories' },
// { title: 'Products', path: '/admin/application/products' },
// { title: 'Sub-Products', path: '/admin/application/sub-products' },
// { title: 'Sizes', path: '/admin/application/sizes' },
// { title: 'Coupons', path: '/admin/application/coupons' },
// // { title: 'User Management', path: '/admin/application/users' },
// { title: 'Videos', path: '/admin/application/videos' },
// // { title: 'Cart', path: '/admin/application/cart' },
// { title: 'Wishlist', path: '/admin/application/wishlist' },
// { title: 'Client Rewards', path: '/admin/application/rewards' },
// { title: 'Notifications', path: '/admin/application/notifications' },
// { title: 'FAQs', path: '/admin/application/faqs' }
//       ]
//     },
// {
//   title: 'Order Management',
//     icon: 'ri-shopping-bag-line',
//       path: '/admin/orders'
// },
// {
//   title: 'Sales & Reports',
//     icon: 'ri-bar-chart-line',
//       path: '/admin/sales'
// },
// {
//   title: 'Return & Challan',
//     icon: 'ri-exchange-line',
//       path: '/admin/returns'
// },
// {
//   title: 'User Management',
//     icon: 'ri-user-settings-line',
//       path: '/admin/users'
// },
// {
//   title: 'Admin & Staff Roles',
//     icon: 'ri-shield-user-line',
//       path: '/admin/user-roles'
// },
// {
//   title: 'Marketing',
//     icon: 'ri-megaphone-line',
//       path: '/admin/marketing'
// },
// {
//   title: 'Enquiries',
//     icon: 'ri-question-answer-line',
//       path: '/admin/enquiries'
// },
// {
//   title: 'Catalogue Upload',
//     icon: 'ri-file-pdf-line',
//       path: '/admin/catalogue'
// }
//   ];

// const toggleExpanded = (index) => {
//   setExpandedItems(prev => ({
//     ...prev,
//     [index]: !prev[index]
//   }));
// };

// const handleNavigation = (path) => {
//   navigate(path);
//   if (window.innerWidth < 1024) {
//     onClose();
//   }
// };


// const fetchRoles = async () => {
//   try {
//     const response = await postData('api/adminRole/get-single-role-by-role', { role: user?.role });
//     console.log("response.data:==>response.data:==>BBB", response?.data[0]?.permissions)
//     setPermiton(response?.data[0]?.permissions)
//   } catch (error) {
//     console.log(error)
//   }
// }

// useEffect(() => {
//   fetchRoles()
// }, [user?.role])


// return (
//   <>
//     {/* Mobile overlay */}
//     {isOpen && (
//       <div
//         className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//         onClick={onClose}
//       />
//     )}

//     {/* Sidebar */}
//     <div className={`fixed left-0 top-0 h-full w-64 border-r transform transition-all duration-300 ease-in-out z-50 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
//       } ${isDarkMode
//         ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
//       }`}>
//       <div className="flex flex-col h-full">
//         {/* Logo */}
//         <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
//           }`}>
//           <div className="flex items-center space-x-3">
//             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//               <i className="ri-shirt-line text-white text-lg"></i>
//             </div>
//             <span className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`} style={{ fontFamily: '"Pacifico", serif' }}>
//               Garments Admin
//             </span>
//           </div>
//           <button
//             onClick={onClose}
//             className={`lg:hidden p-1 rounded-md transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
//               }`}
//           >
//             <i className="ri-close-line"></i>
//           </button>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 overflow-y-auto py-4">
//           <ul className="space-y-1 px-3">
//             {menuItems.map((item, index) => (
//               <li key={index}>
//                 {item.children ? (
//                   <div>
//                     <button
//                       onClick={() => toggleExpanded(index)}
//                       className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors ${isDarkMode
//                         ? 'text-gray-300 hover:bg-gray-700'
//                         : 'text-gray-700 hover:bg-gray-100'
//                         }`}
//                     >
//                       <div className="flex items-center space-x-3">
//                         <i className={`${item.icon} text-lg`}></i>
//                         <span className="font-medium">{item.title}</span>
//                       </div>
//                       <i className={`ri-arrow-down-s-line transition-transform ${expandedItems[index] ? 'rotate-180' : ''}`}></i>
//                     </button>
//                     {expandedItems[index] && (
//                       <ul className="mt-1 ml-6 space-y-1">
//                         {item.children.map((child, childIndex) => (
//                           <li key={childIndex}>
//                             <button
//                               onClick={() => handleNavigation(child.path)}
//                               className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${location.pathname === child.path
//                                 ? 'bg-blue-100 text-blue-700'
//                                 : isDarkMode
//                                   ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'text-gray-600 hover:bg-gray-100'
//                                 }`}
//                             >
//                               {child.title}
//                             </button>
//                           </li>
//                         ))}
//                       </ul>
//                     )}
//                   </div>
//                 ) : (
//                   <button
//                     onClick={() => handleNavigation(item.path)}
//                     className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${location.pathname === item.path
//                       ? 'bg-blue-100 text-blue-700'
//                       : isDarkMode
//                         ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
//                       }`}
//                   >
//                     <i className={`${item.icon} text-lg`}></i>
//                     <span className="font-medium">{item.title}</span>
//                   </button>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </nav>
//       </div>
//     </div>
//   </>
// );
// }




import { use, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { postData } from '../../services/FetchNodeServices';

export default function Sidebar({ isOpen, onClose, isDarkMode }) {
  const [expandedItems, setExpandedItems] = useState({ 1: true });
  const [permissions, setPermissions] = useState({});
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("JeansUser")));
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch permissions
  const fetchRoles = async () => {
    try {
      const response = await postData('api/adminRole/get-single-role-by-role', { role: user?.role });
      const perms = response?.data?.[0]?.permissions || {};
      setPermissions(perms);
      console.log("Loaded permissions:", perms);
    } catch (error) {
      console.error("Failed to fetch role permissions:", error);
    }
  };

  useEffect(() => {
    if (user?.role) fetchRoles();
  }, [user?.role]);

  const toggleExpanded = (index) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) onClose();
  };




  // // { title: 'Cart', path: '/admin/application/cart' },
  // { title: 'Wishlist', path: '/admin/application/wishlist' },
  // { title: 'Client Rewards', path: '/admin/application/rewards' },
  // { title: 'Notifications', path: '/admin/application/notifications' },
  // { title: 'FAQs', path: '/admin/application/faqs' }
  //       ]
  //     },
  // {
  //   title: 'Order Management',
  //     icon: 'ri-shopping-bag-line',
  //       path: '/admin/orders'
  // },
  // {
  //   title: 'Sales & Reports',
  //     icon: 'ri-bar-chart-line',
  //       path: '/admin/sales'
  // },
  // {
  //   title: 'Return & Challan',
  //     icon: 'ri-exchange-line',
  //       path: '/admin/returns'
  // },
  // {
  //   title: 'User Management',
  //     icon: 'ri-user-settings-line',
  //       path: '/admin/users'
  // },
  // {
  //   title: 'Admin & Staff Roles',
  //     icon: 'ri-shield-user-line',
  //       path: '/admin/user-roles'
  // },
  // {
  //   title: 'Marketing',
  //     icon: 'ri-megaphone-line',
  //       path: '/admin/marketing'
  // },
  // {
  //   title: 'Enquiries',
  //     icon: 'ri-question-answer-line',
  //       path: '/admin/enquiries'
  // },
  // {
  //   title: 'Catalogue Upload',
  //     icon: 'ri-file-pdf-line',
  //       path: '/admin/catalogue'
  // }
  //   ];


  // Build menu dynamically based on permissions
  const menuItems = [
    ...(permissions?.dashboard?.read || user?.role === 'Super Admin' ? [{ title: 'Dashboard', icon: 'ri-dashboard-line', path: '/admin/dashboard', }] : []),
    {
      title: 'Application Management',
      icon: 'ri-settings-3-line',
      children: [
        ...(permissions?.banners?.read ? [{ title: 'Banners', path: '/admin/application/banners' }] : []),
        ...(permissions?.categories?.read ? [{ title: 'Categories', path: '/admin/application/categories' }] : []),
        ...(permissions?.categories?.read ? [{ title: 'Sub-Categories', path: '/admin/application/subcategories' }] : []),
        ...(permissions?.products?.read ? [{ title: 'Products', path: '/admin/application/products' }] : []),
        ...(permissions?.products?.read ? [{ title: 'Sub-Products', path: '/admin/application/sub-products' }] : []),
        ...(permissions?.sizes?.read ? [{ title: 'Sizes', path: '/admin/application/sizes' }] : []),
        ...(permissions?.coupons?.read ? [{ title: 'Coupons', path: '/admin/application/coupons' }] : []),
        ...(permissions?.videos?.read ? [{ title: 'Videos', path: '/admin/application/videos' }] : []),
        ...(permissions?.wishlists?.read ? [{ title: 'Wishlist', path: '/admin/application/wishlist' }] : []),
        ...(permissions?.clientRewards?.read ? [{ title: 'Client Rewards', path: '/admin/application/rewards' }] : []),
        ...(permissions?.notifications?.read ? [{ title: 'Notifications', path: '/admin/application/notifications' }] : []),
        ...(permissions?.FAQs?.read ? [{ title: 'FAQs', path: '/admin/application/faqs' }] : []),
      ],
    },
    ...(permissions?.orders?.read ? [{ title: 'Order Management', icon: 'ri-shopping-bag-line', path: '/admin/orders', }] : []),
    ...(permissions?.sales?.read ? [{ title: 'Sales & Reports', icon: 'ri-bar-chart-line', path: '/admin/sales', }] : []),
    ...(permissions?.returns?.read ? [{ title: 'Return & Challan', icon: 'ri-exchange-line', path: '/admin/returns', }] : []),
    ...(permissions?.userManagement?.read ? [{ title: 'User Management', icon: 'ri-user-settings-line', path: '/admin/users', }] : []),

    ...(permissions?.admins?.read || user?.role === 'Super Admin' ? [{ title: 'Admin & Staff Roles', icon: 'ri-shield-user-line', path: '/admin/user-roles', }] : []),

    ...(permissions?.marketing?.read ? [{ title: 'Marketing', icon: 'ri-megaphone-line', path: '/admin/marketing', }] : []),
    ...(permissions?.enquiries?.read ? [{ title: 'Enquiries', icon: 'ri-question-answer-line', path: '/admin/enquiries', }] : []),
    ...(permissions?.catalogueUpload?.read ? [{ title: 'Catalogue Upload', icon: 'ri-file-pdf-line', path: '/admin/catalogue', }] : []),
  ];
  console.log("GGGGGGGG:=>", permissions)
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 border-r transform transition-all duration-300 ease-in-out z-50 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="ri-shirt-line text-white text-lg"></i>
              </div>
              <span
                className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
                style={{ fontFamily: '"Pacifico", serif' }}
              >
                Garments Admin
              </span>
            </div>
            <button
              onClick={onClose}
              className={`lg:hidden p-1 rounded-md transition-colors ${isDarkMode
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-500'
                }`}
            >
              <i className="ri-close-line"></i>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {menuItems.map((item, index) => (
                <li key={index}>
                  {item.children && item.children.length > 0 ? (
                    <div>
                      <button
                        onClick={() => toggleExpanded(index)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors ${isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <i className={`${item.icon} text-lg`}></i>
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <i
                          className={`ri-arrow-down-s-line transition-transform ${expandedItems[index] ? 'rotate-180' : ''
                            }`}
                        ></i>
                      </button>
                      {expandedItems[index] && (
                        <ul className="mt-1 ml-6 space-y-1">
                          {item.children.map((child, childIndex) => (
                            <li key={childIndex}>
                              <button
                                onClick={() => handleNavigation(child.path)}
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${location.pathname === child.path
                                  ? 'bg-blue-100 text-blue-700'
                                  : isDarkMode
                                    ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                                    : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                              >
                                {child.title}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${location.pathname === item.path
                        ? 'bg-blue-100 text-blue-700'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <i className={`${item.icon} text-lg`}></i>
                      <span className="font-medium">{item.title}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
