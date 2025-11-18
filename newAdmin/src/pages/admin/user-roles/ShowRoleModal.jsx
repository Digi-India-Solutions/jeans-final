import React from 'react'
import Button from '../../../components/base/Button';
import { postData } from '../../../services/FetchNodeServices';

function ShowRoleModal({
    showRoleModal, setShowRoleModal, roles, setRoles, fetchRoles,
    editingRole, setEditingRole, roleForm, setRoleForm, modules }) {


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


    const handleSaveRole = async () => {
        try {
            let response = null

            if (editingRole) {
                // setRoles(roles.map(role => role._id === editingRole._id ? { ...role, ...roleForm } : role));
                response = await postData(`api/adminRole/update-roles-by-admin/${roleForm?._id}`, roleForm);

            } else {
                response = await postData('api/adminRole/create-roles-by-admin', roleForm);
                console.log("response==>", response)
            }

            if (response?.status === true) {
                fetchRoles()
                alert(response?.message);
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
            }
        } catch (error) {
            console.log(error)
        }
    };

    return (
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
                                        sizes: { read: false, write: false, update: false, delete: false },
                                        coupons: { read: false, write: false, update: false, delete: false },
                                        userManagement: { read: false, write: false, update: false, delete: false },
                                        admins: { read: false, write: false, update: false, delete: false },
                                        videos: { read: false, write: false, update: false, delete: false },
                                        wishlists: { read: false, write: false, update: false, delete: false },
                                        clientRewards: { read: false, write: false, update: false, delete: false },
                                        notifications: { read: false, write: false, update: false, delete: false },
                                        FAQs: { read: false, write: false, update: false, delete: false },
                                        carts: { read: false, write: false, update: false, delete: false },
                                        orders: { read: false, write: false, update: false, delete: false },
                                        sales: { read: false, write: false, update: false, delete: false },
                                        returns: { read: false, write: false, update: false, delete: false },
                                        adminRole: { read: false, write: false, update: false, delete: false },
                                        marketing: { read: false, write: false, update: false, delete: false },
                                        enquiries: { read: false, write: false, update: false, delete: false },

                                        catalogueUpload: { read: false, write: false, update: false, delete: false },
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
                                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={roleForm.description}
                                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
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
                                                        checked={roleForm?.permissions[module?.key]?.read}
                                                        onChange={(e) => updatePermission(module?.key, 'read', e.target.checked)}
                                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={roleForm?.permissions[module?.key]?.write}
                                                        onChange={(e) => updatePermission(module.key, 'write', e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={roleForm?.permissions[module?.key]?.update}
                                                        onChange={(e) => updatePermission(module?.key, 'update', e.target.checked)}
                                                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={roleForm?.permissions[module?.key]?.delete}
                                                        onChange={(e) => updatePermission(module?.key, 'delete', e.target.checked)}
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
                                        sizes: { read: false, write: false, update: false, delete: false },
                                        coupons: { read: false, write: false, update: false, delete: false },
                                        userManagement: { read: false, write: false, update: false, delete: false },
                                        admins: { read: false, write: false, update: false, delete: false },
                                        videos: { read: false, write: false, update: false, delete: false },
                                        carts: { read: false, write: false, update: false, delete: false },
                                        wishlists: { read: false, write: false, update: false, delete: false },
                                        clientRewards: { read: false, write: false, update: false, delete: false },
                                        Notifications: { read: false, write: false, update: false, delete: false },
                                        FAQs: { read: false, write: false, update: false, delete: false },
                                        orders: { read: false, write: false, update: false, delete: false },
                                        sales: { read: false, write: false, update: false, delete: false },
                                        returns: { read: false, write: false, update: false, delete: false },
                                        adminRole: { read: false, write: false, update: false, delete: false },
                                        marketing: { read: false, write: false, update: false, delete: false },
                                        enquiries: { read: false, write: false, update: false, delete: false },
                                        catalogueUpload: { read: false, write: false, update: false, delete: false },
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
    )
}

export default ShowRoleModal
