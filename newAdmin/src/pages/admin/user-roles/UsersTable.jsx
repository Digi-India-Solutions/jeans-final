import React from 'react'
import Card from '../../../components/base/Card'
import Button from '../../../components/base/Button'
import { getData } from '../../../services/FetchNodeServices';

function UsersTable({ setUsers, users, setEditingUser, setUserForm, setShowUserModal, currentUserPage, setCurrentUserPage, totalUserPages }) {

    const handleDeleteUser = async (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            const respons = await getData(`api/admin/delete-admin-user-by-admin/${id}`);
            if (respons?.status === true) {
                setUsers(users.filter(user => user._id !== id));
                alert(respons.message);
            }
        }
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

    const handleEditUser = (user) => {
        setEditingUser(user);
        console.log('XXXXXXXXXXXXXXXX:==>', user)
        setUserForm({ name: user?.name, email: user?.email, phone: user?.phone, oldPassword: user?.password, password: '', role: user?.role, status: user?.status });
        setShowUserModal(true);
    };

    return (
        <div>
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
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>Last Login: {user.lastLogin}</div>
                                        <div>Created: {(user.createdAt).split('T')[0]}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Button
                                                onClick={() => handleEditUser(user)}
                                                className="px-4 py-2 bg-gray-700 text-white disabled:opacity-50 hover:bg-gray-900"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                onClick={() => handleDeleteUser(user._id)}
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

                {totalUserPages > 1 && (
                    <div className="flex justify-center mt-6">
                        <div className="flex space-x-2">
                            <Button
                                onClick={() => setCurrentUserPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentUserPage === 1}
                                className="px-4 py-2 bg-gray-100 text-gray-700 disabled:opacity-50"
                            >
                                Previous
                            </Button>

                            {Array.from({ length: totalUserPages }, (_, i) => i + 1).map(page => (
                                <Button
                                    key={page}
                                    onClick={() => setCurrentUserPage(page)}
                                    className={`px-4 py-2 ${currentUserPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700'}`}
                                >
                                    {page}
                                </Button>
                            ))}

                            <Button
                                onClick={() => setCurrentUserPage(prev => Math.min(prev + 1, totalUserPages))}
                                disabled={currentUserPage === totalUserPages}
                                className="px-4 py-2 bg-gray-100 text-gray-700 disabled:opacity-50"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default UsersTable
