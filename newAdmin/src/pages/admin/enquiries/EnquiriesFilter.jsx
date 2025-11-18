import React from 'react'
import Card from '../../../components/base/Card'
import Button from '../../../components/base/Button'
import { getData, postData } from '../../../services/FetchNodeServices';

function EnquiriesFilter({ setFilteredEnquiries, enquiries, filters, setFilters, currentPage, setTotalPages, fetchAllEnquiries }) {

    const applyFilters = async () => {
        fetchAllEnquiries()
        // const res = await postData(`api/enquiry/get-enquiries-by-filters?page=${currentPage}`, { filters: { ...filters } });
        // if (res.status === true) {
        //     setFilteredEnquiries(res.data);
        //     setTotalPages(res?.pagination?.totalPages || 1);
        // }
    };

    return (
        <div>
            <Card className="mb-6">
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Name, email, subject..."
                                value={filters?.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <div className="relative">
                                <select
                                    value={filters?.type}
                                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                                >
                                    <option value="">All Types</option>
                                    <option value="Franchise">Franchise</option>
                                    <option value="Customer">Customer</option>
                                    <option value="General">General</option>
                                </select>
                                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div> */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <div className="relative">
                                <select
                                    value={filters?.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                                >
                                    <option value="">All Status</option>
                                    <option value="New">New</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div> */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <div className="relative">
                                <select
                                    value={filters?.priority}
                                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                                >
                                    <option value="">All Priority</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div> */}
                        <div className="flex items-end">
                            <Button
                                onClick={applyFilters}
                                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default EnquiriesFilter
