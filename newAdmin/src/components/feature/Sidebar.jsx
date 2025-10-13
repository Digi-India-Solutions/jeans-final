import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const menuItems = [
	{
		title: 'Dashboard',
		icon: 'ri-dashboard-line',
		path: '/admin/dashboard',
	},
	{
		title: 'Application Management',
		icon: 'ri-settings-3-line',
		children: [
			{ title: 'Banners', path: '/admin/application/banners' },
			{ title: 'Categories', path: '/admin/application/categories' },
			{ title: 'Sub-Categories', path: '/admin/application/subcategories' },
			{ title: 'Products', path: '/admin/application/products' },
			{ title: 'Sub-Products', path: '/admin/application/sub-products' },
			{ title: 'Sizes', path: '/admin/application/sizes' },
			{ title: 'Coupons', path: '/admin/application/coupons' },
			// { title: 'User Management', path: '/admin/application/users' },
			{ title: 'Videos', path: '/admin/application/videos' },
			// { title: 'Cart', path: '/admin/application/cart' },
			{ title: 'Wishlist', path: '/admin/application/wishlist' },
			{ title: 'Client Rewards', path: '/admin/application/rewards' },
			{ title: 'Notifications', path: '/admin/application/notifications' },
			{ title: 'FAQs', path: '/admin/application/faqs' },
		],
	},
	{
		title: 'Order Management',
		icon: 'ri-shopping-bag-line',
		path: '/admin/orders',
	},
	{
		title: 'Sales & Reports',
		icon: 'ri-bar-chart-line',
		path: '/admin/sales',
	},
	{
		title: 'Return & Challan',
		icon: 'ri-exchange-line',
		path: '/admin/returns',
	},
	{
		title: 'User Management',
		icon: 'ri-user-settings-line',
		path: '/admin/users',
	},
	{
		title: 'Admin & Staff Roles',
		icon: 'ri-shield-user-line',
		path: '/admin/user-roles',
	},
	{
		title: 'Marketing',
		icon: 'ri-megaphone-line',
		path: '/admin/marketing',
	},
	{
		title: 'Enquiries',
		icon: 'ri-question-answer-line',
		path: '/admin/enquiries',
	},
	{
		title: 'Catalogue Upload',
		icon: 'ri-file-pdf-line',
		path: '/admin/catalogue',
	},
];

export default function Sidebar({ isOpen, onClose }) {
	const [expandedItems, setExpandedItems] = useState({});
	const location = useLocation();
	const navigate = useNavigate();

	const toggleExpanded = (index) => {
		setExpandedItems((prev) => ({
			...prev,
			[index]: !prev[index],
		}));
	};

	const handleNavigation = (path) => {
		navigate(path);
		if (window.innerWidth < 1024) {
			onClose();
		}
	};

	return (
		<>
			{/* Mobile overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
					onClick={onClose}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`fixed left-0 top-0 h-full w-52 transform transition-all duration-300 ease-in-out z-50 lg:translate-x-0 ${
					isOpen ? 'translate-x-0' : '-translate-x-full'
				} bg-white border-r border-gray-100 shadow-sm`}
			>
				<div className="flex flex-col h-full">
					{/* Logo */}
					<div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
						<div className="flex items-center space-x-3">
							<div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
								<i className="ri-shirt-line text-white text-lg"></i>
							</div>
							<span className="text-lg font-semibold text-gray-800" style={{ fontFamily: '"Pacifico", serif' }}>
								Garments Admin
							</span>
						</div>
						<button onClick={onClose} className="lg:hidden p-1 rounded-md transition-colors hover:bg-gray-100 text-gray-500">
							<i className="ri-close-line"></i>
						</button>
					</div>

					{/* Navigation */}
					<nav className="flex-1 overflow-y-auto py-2">
						<ul className="space-y-1 px-2">
							{menuItems.map((item, index) => (
								<li key={index}>
									{item.children ? (
										<div>
																	<button
																		onClick={() => toggleExpanded(index)}
																		className={`w-full flex items-center justify-between px-3 py-2 mx-2 text-left rounded-full transition-colors ${location.pathname.startsWith(item.path) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
											>
												<div className="flex items-center space-x-3">
													<i className={`${item.icon} text-base text-blue-600`}></i>
													<span className="font-medium text-sm">{item.title}</span>
												</div>
												<i className={`ri-arrow-down-s-line text-gray-400 transition-transform ${expandedItems[index] ? 'rotate-180' : ''}`}></i>
											</button>
											{expandedItems[index] && (
												<ul className="mt-1 ml-6 space-y-1">
													{item.children.map((child, childIndex) => (
														<li key={childIndex}>
															<button
																onClick={() => handleNavigation(child.path)}
																className={`w-full text-left px-3 py-2 text-sm mx-4 rounded-md transition-colors ${location.pathname === child.path ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
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
											className={`w-full flex items-center space-x-3 px-3 py-2 mx-2 text-left rounded-full transition-colors ${location.pathname === item.path ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
										>
											<i className={`${item.icon} text-base text-blue-600`}></i>
											<span className="font-medium text-sm">{item.title}</span>
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