import React from 'react'
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';
import { getData } from '../../../services/FetchNodeServices';

function RolesTable({ user, permiton, setEditingRole, setRoleForm, setShowRoleModal, roles, modules, fetchRoles }) {

    const handleEditRole = (role) => {
        setEditingRole(role);
        setRoleForm(role);
        setShowRoleModal(true);
    };

    const handleDeleteRole = async (id) => {
        try {
            if (confirm('Are you sure you want to delete this role?')) {
                const respons = await getData(`api/adminRole/delete-roles-by-admin/${id}`)
                console.log("respons-====>", respons)
                if (respons?.status === true) {
                    fetchRoles()
                }
            }
        } catch (error) {
            console.log(error)
        }

    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {roles.map(role => (
                <Card key={role.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{role.name}</h3>
                            <p className="text-sm text-gray-600">{role?.description}</p>
                        </div>
                        <div className="flex space-x-2">
                            {permiton.update || user?.role === "Super Admin" && <Button
                                onClick={() => handleEditRole(role)}
                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-1"
                            >
                                <i className="ri-edit-line mr-1"></i>
                                Edit
                            </Button>}
                            {permiton.delete || user?.role === "Super Admin" && <Button
                                onClick={() => handleDeleteRole(role?._id)}
                                className="bg-red-50 text-red-600 hover:bg-red-100 text-xs px-2 py-1"
                            >
                                <i className="ri-delete-bin-line"></i>
                            </Button>}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">Permissions Overview</h4>
                        {modules?.slice(0, 20).map(module => {
                            const perms = role?.permissions[module?.key];
                            const permCount = Object.values(perms).filter(Boolean).length;
                            return (
                                <div key={module?.key} className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">{module?.name}</span>
                                    <div className="flex space-x-1">
                                        {perms?.read && <span className="w-2 h-2 bg-green-400 rounded-full"></span>}
                                        {perms?.write && <span className="w-2 h-2 bg-blue-400 rounded-full"></span>}
                                        {perms?.update && <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>}
                                        {perms?.delete && <span className="w-2 h-2 bg-red-400 rounded-full"></span>}
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
    )
}

export default RolesTable
