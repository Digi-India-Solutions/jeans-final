import { useState } from 'react';
import AdminLayout from '../../../components/feature/AdminLayout';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

export default function UserRolesManagement() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@admin.com',
      phone: '+91 98765 43210',
      role: 'Super Admin',
      status: 'Active',
      lastLogin: '2024-01-15',
      createdAt: '2024-01-01'
    },
    {
      id: 2,
      name: 'Sarah Manager',
      email: 'sarah@admin.com',
      phone: '+91 87654 32109',
      role: 'Manager',
      status: 'Active',
      lastLogin: '2024-01-14',
      createdAt: '2024-01-05'
    },
    {
      id: 3,
      name: 'Mike Staff',
      email: 'mike@admin.com',
      phone: '+91 76543 21098',
      role: 'Staff',
      status: 'Active',
      lastLogin: '2024-01-13',
      createdAt: '2024-01-10'
    }
  ]);

  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      permissions: {
        dashboard: { read: true, write: true, update: true, delete: true },
        banners: { read: true, write: true, update: true, delete: true },
        categories: { read: true, write: true, update: true, delete: true },
        products: { read: true, write: true, update: true, delete: true },
        orders: { read: true, write: true, update: true, delete: true },
        sales: { read: true, write: true, update: true, delete: true },
        returns: { read: true, write: true, update: true, delete: true },
        marketing: { read: true, write: true, update: true, delete: true },
        enquiries: { read: true, write: true, update: true, delete: true }
      }
    },
    {
      id: 2,
      name: 'Manager',
      description: 'Management level access with most permissions',
      permissions: {
        dashboard: { read: true, write: true, update: true, delete: false },
        banners: { read: true, write: true, update: true, delete: true },
        categories: { read: true, write: true, update: true, delete: true },
        products: { read: true, write: true, update: true, delete: false },
        orders: { read: true, write: true, update: true, delete: false },
        sales: { read: true, write: false, update: false, delete: false },
        returns: { read: true, write: true, update: true, delete: false },
        marketing: { read: true, write: true, update: true, delete: false },
        enquiries: { read: true, write: true, update: true, delete: false }
      }
    },
    {
      id: 3,
      name: 'Staff',
      description: 'Basic staff access with limited permissions',
      permissions: {
        dashboard: { read: true, write: false, update: false, delete: false },
        banners: { read: true, write: false, update: false, delete: false },
        categories: { read: true, write: false, update: false, delete: false },
        products: { read: true, write: true, update: true, delete: false },
        orders: { read: true, write: true, update: true, delete: false },
        sales: { read: true, write: false, update: false, delete: false },
        returns: { read: true, write: true, update: false, delete: false },
        marketing: { read: false, write: false, update: false, delete: false },
        enquiries: { read: true, write: false, update: false, delete: false }
      }
    },
    {
      id: 4,
      name: 'Viewer',
      description: 'Read-only access for viewing data',
      permissions: {
        dashboard: { read: true, write: false, update: false, delete: false },
        banners: { read: true, write: false, update: false, delete: false },
        categories: { read: true, write: false, update: false, delete: false },
        products: { read: true, write: false, update: false, delete: false },
        orders: { read: true, write: false, update: false, delete: false },
        sales: { read: true, write: false, update: false, delete: false },
        returns: { read: true, write: false, update: false, delete: false },
        marketing: { read: true, write: false, update: false, delete: false },
        enquiries: { read: true, write: false, update: false, delete: false }
      }
    }
  ]);

  const [activeTab, setActiveTab] = useState('users');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    status: 'Active'
  });

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: {
      dashboard: { read: false, write: false, update: false, delete: false },
      banners: { read: false, write: false, update: false, delete: false },
      categories: { read: false, write: false, update: false, delete: false },
      products: { read: false, write: false, update: false, delete: false },
      orders: { read: false, write: false, update: false, delete: false },
      sales: { read: false, write: false, update: false, delete: false },
      returns: { read: false, write: false, update: false, delete: false },
      marketing: { read: false, write: false, update: false, delete: false },
      enquiries: { read: false, write: false, update: false, delete: false }
    }
  });

  const modules = [
    { key: 'dashboard', name: 'Dashboard' },
    { key: 'banners', name: 'Banners' },
    { key: 'categories', name: 'Categories & Sub-Categories' },
    { key: 'products', name: 'Products & Sub-Products' },
    { key: 'orders', name: 'Order Management' },
    { key: 'sales', name: 'Sales & Reports' },
    { key: 'returns', name: 'Returns & Challan' },
    { key: 'marketing', name: 'Marketing' },
    { key: 'enquiries', name: 'Enquiries' }
  ];

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...userForm }
          : user
      ));
    } else {
      setUsers([...users, {
        ...userForm,
        id: Date.now(),
        lastLogin: 'Never',
        createdAt: new Date().toISOString().split('T')[0]
      }]);
    }
    
    setUserForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: '',
      status: 'Active'
    });
    setEditingUser(null);
    setShowUserModal(false);
  };

  const handleSaveRole = () => {
    if (editingRole) {
      setRoles(roles.map(role => 
        role.id === editingRole.id 
          ? { ...role, ...roleForm }
          : role
      ));
    } else {
      setRoles([...roles, {
        ...roleForm,
        id: Date.now()
      }]);
    }
    
    setRoleForm({
      name: '',
      description: '',
      permissions: {
        dashboard: { read: false, write: false, update: false, delete: false },
        banners: { read: false, write: false, update: false, delete: false },
        categories: { read: false, write: false, update: false, delete: false },
        products: { read: false, write: false, update: false, delete: false },
        orders: { read: false, write: false, update: false, delete: false },
        sales: { read: false, write: false, update: false, delete: false },
        returns: { read: false, write: false, update: false, delete: false },
        marketing: { read: false, write: false, update: false, delete: false },
        enquiries: { read: false, write: false, update: false, delete: false }
      }
    });
    setEditingRole(null);
    setShowRoleModal(false);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '',
      role: user.role,
      status: user.status
    });
    setShowUserModal(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleForm(role);
    setShowRoleModal(true);
  };

  const handleDeleteUser = (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const handleDeleteRole = (id) => {
    if (confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(role => role.id !== id));
    }
  };

  const updatePermission = (module, permission, value) => {
    setRoleForm({
      ...roleForm,
      permissions: {
        ...roleForm.permissions,
        [module]: {
          ...roleForm.permissions[module],
          [permission]: value
        }
      }
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      'Super Admin': 'bg-red-100 text-red-800',
      'Manager': 'bg-blue-100 text-blue-800',
      'Staff': 'bg-green-100 text-green-800',
      'Viewer': 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User & Role Management</h1>
            <p className="text-gray-600 mt-1">Manage admin users and their role-based permissions</p>
          </div>
          <div className="flex space-x-3">
            {activeTab === 'users' ? (
              <Button
                onClick={() => setShowUserModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <i className="ri-user-add-line mr-2"></i>
                Add User
              </Button>
            ) : (
              <Button
                onClick={() => setShowRoleModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <i className="ri-shield-user-line mr-2"></i>
                Add Role
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className="ri-user-line mr-1"></i>
            Admin Users
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'roles'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className="ri-shield-user-line mr-1"></i>
            Roles & Permissions
          </button>
        </div>

        {activeTab === 'users' && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role & Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>Last Login: {user.lastLogin}</div>
                        <div>Created: {user.createdAt}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleEditUser(user)}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-1"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 text-xs px-2 py-1"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {roles.map(role => (
              <Card key={role.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{role.name}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEditRole(role)}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-1"
                    >
                      <i className="ri-edit-line mr-1"></i>
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteRole(role.id)}
                      className="bg-red-50 text-red-600 hover:bg-red-100 text-xs px-2 py-1"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Permissions Overview</h4>
                  {modules.slice(0, 5).map(module => {
                    const perms = role.permissions[module.key];
                    const permCount = Object.values(perms).filter(Boolean).length;
                    return (
                      <div key={module.key} className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">{module.name}</span>
                        <div className="flex space-x-1">
                          {perms.read && <span className="w-2 h-2 bg-green-400 rounded-full"></span>}
                          {perms.write && <span className="w-2 h-2 bg-blue-400 rounded-full"></span>}
                          {perms.update && <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>}
                          {perms.delete && <span className="w-2 h-2 bg-red-400 rounded-full"></span>}
                          {permCount === 0 && <span className="text-xs text-gray-400">No access</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    <span className="inline-flex items-center mr-3">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                      Read
                    </span>
                    <span className="inline-flex items-center mr-3">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                      Write
                    </span>
                    <span className="inline-flex items-center mr-3">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                      Update
                    </span>
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                      Delete
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingUser ? 'Edit Admin User' : 'Add New Admin User'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      setEditingUser(null);
                      setUserForm({
                        name: '',
                        email: '',
                        phone: '',
                        password: '',
                        role: '',
                        status: 'Active'
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={userForm.name}
                      onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {editingUser ? 'New Password (leave empty to keep current)' : 'Password'}
                    </label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={!editingUser}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <div className="relative">
                        <select
                          value={userForm.role}
                          onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                          required
                        >
                          <option value="">Select Role</option>
                          {roles.map(role => (
                            <option key={role.id} value={role.name}>{role.name}</option>
                          ))}
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div className="relative">
                        <select
                          value={userForm.status}
                          onChange={(e) => setUserForm({...userForm, status: e.target.value})}
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={() => {
                      setShowUserModal(false);
                      setEditingUser(null);
                      setUserForm({
                        name: '',
                        email: '',
                        phone: '',
                        password: '',
                        role: '',
                        status: 'Active'
                      });
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveUser}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    disabled={!userForm.name || !userForm.email || !userForm.phone || (!editingUser && !userForm.password) || !userForm.role}
                  >
                    {editingUser ? 'Update User' : 'Add User'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Role Modal */}
        {showRoleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingRole ? 'Edit Role' : 'Create New Role'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowRoleModal(false);
                      setEditingRole(null);
                      setRoleForm({
                        name: '',
                        description: '',
                        permissions: {
                          dashboard: { read: false, write: false, update: false, delete: false },
                          banners: { read: false, write: false, update: false, delete: false },
                          categories: { read: false, write: false, update: false, delete: false },
                          products: { read: false, write: false, update: false, delete: false },
                          orders: { read: false, write: false, update: false, delete: false },
                          sales: { read: false, write: false, update: false, delete: false },
                          returns: { read: false, write: false, update: false, delete: false },
                          marketing: { read: false, write: false, update: false, delete: false },
                          enquiries: { read: false, write: false, update: false, delete: false }
                        }
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                      <input
                        type="text"
                        value={roleForm.name}
                        onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={roleForm.description}
                        onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Module Permissions</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Module</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Read</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Write</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Update</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {modules.map(module => (
                            <tr key={module.key} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{module.name}</td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={roleForm.permissions[module.key].read}
                                  onChange={(e) => updatePermission(module.key, 'read', e.target.checked)}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={roleForm.permissions[module.key].write}
                                  onChange={(e) => updatePermission(module.key, 'write', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={roleForm.permissions[module.key].update}
                                  onChange={(e) => updatePermission(module.key, 'update', e.target.checked)}
                                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={roleForm.permissions[module.key].delete}
                                  onChange={(e) => updatePermission(module.key, 'delete', e.target.checked)}
                                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={() => {
                      setShowRoleModal(false);
                      setEditingRole(null);
                      setRoleForm({
                        name: '',
                        description: '',
                        permissions: {
                          dashboard: { read: false, write: false, update: false, delete: false },
                          banners: { read: false, write: false, update: false, delete: false },
                          categories: { read: false, write: false, update: false, delete: false },
                          products: { read: false, write: false, update: false, delete: false },
                          orders: { read: false, write: false, update: false, delete: false },
                          sales: { read: false, write: false, update: false, delete: false },
                          returns: { read: false, write: false, update: false, delete: false },
                          marketing: { read: false, write: false, update: false, delete: false },
                          enquiries: { read: false, write: false, update: false, delete: false }
                        }
                      });
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveRole}
                    className="flex-1 bg-purple-600 text-white hover:bg-purple-700"
                    disabled={!roleForm.name || !roleForm.description}
                  >
                    {editingRole ? 'Update Role' : 'Create Role'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}