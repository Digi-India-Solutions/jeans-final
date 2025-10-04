import React from 'react'
import Button from '../../../components/base/Button';
import { postData } from '../../../services/FetchNodeServices';

function ShowUserModal({ setShowUserModal, userForm, setUserForm, editingUser, setEditingUser, roles, fetchUsers }) {
    const handleSaveUser = async () => {
        let respons = ''

        if (editingUser) {
            // setUsers(users.map(user => user._id === editingUser._id ? { ...user, ...userForm } : user));
            alert(editingUser?._id)
            respons = await postData(`api/admin/update-admin-by-admin/${editingUser?._id}`, { userForm });
            console.log("ADD NEW ADMIN USER=>", respons);

        } else {
            respons = await postData(`api/admin/create-admin-by-admin`, { userForm });
            // console.log("ADD NEW ADMIN USER=>", respons);
        }

        if (respons?.status === true) {
            alert(respons.message);
            fetchUsers()
            setUserForm({ name: '', email: '', phone: '', password: '', role: '', status: 'Active', oldPassword: '' });
            setEditingUser(null);
            setShowUserModal(false);
        } else {
            alert(respons.message);
        }


    };

    console.log("ADD NEW ADMIN USER=>", userForm);

    return (
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
                                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={userForm.email}
                                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                value={userForm.phone}
                                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
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
                                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
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
                                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
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
                                        onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
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
    )
}

export default ShowUserModal
