import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/feature/AdminLayout';
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';
import UsersTable from './UsersTable';
import RolesTable from './RolesTable';
import ShowUserModal from './ShowUserModal';
import ShowRoleModal from './ShowRoleModal';
import { getData } from '../../../services/FetchNodeServices';

export default function UserRolesManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [activeTab, setActiveTab] = useState('users');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [currentRolePage, setCurrentRolePage] = useState(1);
  const [totalUserPages, setTotalUserPages] = useState(1);
  const [totalRolePages, setTotalRolePages] = useState(1);
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("JeansUser")));
  const [permiton, setPermiton] = useState('');

  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', password: '', role: '', status: 'Active' });

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
    { key: 'sizes', name: 'Sizes' },
    { key: 'coupons', name: 'Coupons & Offers' },
    { key: 'userManagement', name: 'User Management' },
    { key: 'admins', name: 'Admin & Staff Roles' },
    { key: 'videos', name: 'Videos' },
    { key: 'wishlists', name: 'Wishlists' },
    { key: 'clientRewards', name: 'Client Rewards' },

    { key: 'notifications', name: 'Notifications' },
    { key: 'FAQs', name: 'FAQs' },

    { key: 'orders', name: 'Order Management' },
    { key: 'sales', name: 'Sales & Reports' },
    { key: 'returns', name: 'Returns & Challan' },
    { key: 'marketing', name: 'Marketing' },
    { key: 'enquiries', name: 'Enquiries' },
    { key: 'catalogueUpload', name: 'Catalogue Upload' }
  ];



  const fetchUsers = async () => {
    try {
      const response = await getData(`api/admin/getAdminUsersByAdminwithPagination?page=${currentUserPage}&limit=10`);
      console.log("response.data:==>", response);
      if (response?.status === true) {
        setUsers(response?.data);
        setTotalUserPages(response?.pagination?.totalPages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };


  const fetchRoles = async () => {
    try {
      const response = await getData('api/adminRole/get-all-roles');
      console.log("response.data:==>response.data:==>", response);
      if (response.status === true) {
        setRoles(response?.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [currentUserPage]);


  const fetchRolesByRole = async () => {
    try {
      const response = await postData('api/adminRole/get-single-role-by-role', { role: user?.role });
      console.log("response.data:==>response.data:==>", response?.data[0]?.permissions)
      setPermiton(response?.data[0]?.permissions?.admins)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchRolesByRole()
  }, [user?.role])

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User & Role Management</h1>
            <p className="text-gray-600 mt-1">Manage admin users and their role-based permissions</p>
          </div>
          {permiton?.write || user?.role === 'Super Admin' && <div className="flex space-x-3">
            {activeTab === 'users' ? (
              <Button onClick={() => setShowUserModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white"              >
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
          </div>}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'users'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <i className="ri-user-line mr-1"></i>
            Admin Users
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'roles'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <i className="ri-shield-user-line mr-1"></i>
            Roles & Permissions
          </button>
        </div>

        {activeTab === 'users' && (
          <UsersTable userPermition={user} permiton={permiton} currentUserPage={currentUserPage} setCurrentUserPage={setCurrentUserPage} totalUserPages={totalUserPages} setUsers={setUsers} users={users} setEditingUser={setEditingUser} setUserForm={setUserForm} setShowUserModal={setShowUserModal} />
        )}

        {activeTab === 'roles' && (
          <RolesTable user={user} permiton={permiton} fetchRoles={fetchRoles} currentRolePage={currentRolePage} setCurrentRolePage={setCurrentRolePage} totalRolePages={totalRolePages} modules={modules} setEditingRole={setEditingRole} setRoleForm={setRoleForm} setShowRoleModal={setShowRoleModal} roles={roles} />
        )}

        {/* User Modal */}
        {showUserModal && (
          <ShowUserModal fetchUsers={fetchUsers} setShowUserModal={setShowUserModal} userForm={userForm} setUserForm={setUserForm} editingUser={editingUser} setEditingUser={setEditingUser} roles={roles} />
        )}

        {/* Role Modal */}
        {showRoleModal && (
          <ShowRoleModal fetchRoles={fetchRoles} modules={modules} setShowRoleModal={setShowRoleModal} roleForm={roleForm} setRoleForm={setRoleForm} editingRole={editingRole} setEditingRole={setEditingRole} />
        )}
      </div>
    </AdminLayout>
  );
}