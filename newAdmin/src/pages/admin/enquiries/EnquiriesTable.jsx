import React from 'react'
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';
import { postData } from '../../../services/FetchNodeServices';

function EnquiriesTable({
    filteredEnquiries, setEnquiries, enquiries,
    setSelectedEnquiry, setResponseForm, setShowEnquiryModal,
    currentPage, totalPages, setCurrentPage, fetchAllEnquiries
}) {

    const updateEnquiryStatus = async (id, status) => {

        const update = await postData(`api/enquiry/update-enquiry/${id}`, { status });
        console.log("update:::=>", update)
        if (update.success === true) {
            fetchAllEnquiries();
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': 'bg-blue-100 text-blue-800',
            'In Progress': 'bg-yellow-100 text-yellow-800',
            'Resolved': 'bg-green-100 text-green-800',
            'Closed': 'bg-gray-700 text-white'
        };
        return colors[status] || 'bg-gray-700 text-white';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'High': 'bg-red-100 text-red-800',
            'Medium': 'bg-yellow-100 text-yellow-800',
            'Low': 'bg-green-100 text-green-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const getTypeColor = (type) => {
        const colors = {
            'Franchise': 'bg-purple-100 text-purple-800',
            'Customer': 'bg-blue-100 text-blue-800',
            'General': 'bg-gray-100 text-gray-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };


    return (
        <div>
            <div className="space-y-4">
                {filteredEnquiries.map(enquiry => (
                    <Card key={enquiry._id}>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="font-semibold text-gray-900">{enquiry?.name}</h3>
                                        {/* <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(enquiry?.type)}`}>
                                            {enquiry?.type}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(enquiry?.priority)}`}>
                                            {enquiry?.priority}
                                        </span> */}
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry?.enquirystatus)}`}>
                                            {enquiry?.enquirystatus}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">{enquiry.subject}</span>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                                        <div>
                                            <span className="text-gray-500">Email:</span>
                                            <div className="font-medium">{enquiry.email}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Phone:</span>
                                            <div className="font-medium">{enquiry.phone}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Location:</span>
                                            <div className="font-medium">{enquiry.p_location}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Submitted:</span>
                                            <div className="font-medium">{enquiry.createdAt.split('T')[0]}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-3">
                                        <span className="font-medium">Message:</span>
                                        <p className="mt-1">{enquiry.message}</p>
                                    </div>

                                    {enquiry.assignedTo && (
                                        <div className="text-sm text-gray-600 mb-3">
                                            <span className="text-gray-500">Assigned to:</span>
                                            <span className="font-medium ml-1">{enquiry.assignedTo}</span>
                                        </div>
                                    )}

                                    {enquiry.response && (
                                        <div className="bg-blue-50 p-3 rounded-lg text-sm">
                                            <span className="font-medium text-blue-800">Response:</span>
                                            <p className="text-blue-700 mt-1">{enquiry.response}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Last updated: {enquiry?.updatedAt.split('T')[0]}
                                </div>
                                <div className="flex space-x-2">
                                    {enquiry.enquirystatus === 'New' && (
                                        <Button
                                            onClick={() => updateEnquiryStatus(enquiry._id, 'In Progress')}
                                            className="bg-yellow-400 text-white hover:bg-yellow-200 text-sm px-3 py-1"
                                        >
                                            <i className="ri-play-line mr-1"></i>
                                            Start
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => {
                                            setSelectedEnquiry(enquiry);
                                            setResponseForm({
                                                response: enquiry.response || '',
                                                status: enquiry.status,
                                                assignedTo: enquiry.assignedTo || ''
                                            });
                                            setShowEnquiryModal(true);
                                        }}
                                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm px-3 py-1"
                                    >
                                        <i className="ri-reply-line mr-1"></i>
                                        Respond
                                    </Button>
                                    {enquiry.enquirystatus === 'In Progress' && (
                                        <Button
                                            onClick={() => updateEnquiryStatus(enquiry._id, 'Resolved')}
                                            className="bg-green-50 text-green-600 hover:bg-green-100 text-sm px-3 py-1"
                                        >
                                            <i className="ri-check-line mr-1"></i>
                                            Resolve
                                        </Button>
                                    )}
                                    {/* <Button
                                        onClick={() => {
                                            const phoneNumber = enquiry.phone.replace(/\s+/g, '');
                                            window.open(`tel:${phoneNumber}`, '_self');
                                        }}
                                        className="bg-green-50 text-green-600 hover:bg-green-300 text-sm px-3 py-1"
                                    >
                                        <i className="ri-phone-line mr-1"></i>
                                        Call
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            window.open(`mailto:${enquiry.email}?subject=Re: ${enquiry.subject}`, '_blank');
                                        }}
                                        className="bg-purple-500 text-white hover:bg-purple-400 text-sm px-3 py-1"
                                    >
                                        <i className="ri-mail-line mr-1"></i>
                                        Email
                                    </Button> */}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            {totalPages > 1 && (
                <div className="flex justify-center sticky top-0 bg-gray-50 z-10">
                    <div className="flex space-x-2 sticky top-0 bg-gray-50 z-10">
                        <Button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-100 text-gray-700 disabled:opacity-50"
                        >
                            Previous
                        </Button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-4 py-2 ${currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                {page}
                            </Button>
                        ))}

                        <Button
                            onClick={() =>
                                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                            }
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-100 text-gray-700 disabled:opacity-50"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EnquiriesTable
