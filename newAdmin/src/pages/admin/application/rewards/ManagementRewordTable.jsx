import React, { useEffect } from 'react'
import Button from '../../../../components/base/Button';
import Card from '../../../../components/base/Card';

function ManagementRewordTable({
    setSelectedCustomer, filteredCustomers, setShowCustomerModal,
    totalPoints, setTotalPoints, setPointsRedeemed, pointsRedeemed,
    totalPages, setCurrentPage, currentPage }) {

    const calculateDaysUntilExpiry = (createdAt) => {
        if (!createdAt) return 0;
        const today = new Date();
        const created = new Date(createdAt);
        // Example: points expire in 90 days
        const expiry = new Date(created.getTime() + 90 * 24 * 60 * 60 * 1000);
        const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    useEffect(() => {
        if (!filteredCustomers?.length) {
            setTotalPoints(0);
            setPointsRedeemed(0);
            return;
        }

        let earned = 0;
        let redeemed = 0;

        filteredCustomers.forEach((customer) => {
            const totalEarned =
                customer.history
                    ?.filter((h) => h.type === "earned")
                    .reduce((sum, h) => sum + h.amount, 0) || 0;

            const totalRedeemed =
                customer.history
                    ?.filter((h) => h.type === "redeemed")
                    .reduce((sum, h) => sum + h.amount, 0) || 0;

            earned += totalEarned;
            redeemed += totalRedeemed;
        });

        setTotalPoints(earned - redeemed);
        setPointsRedeemed(redeemed);
    }, [filteredCustomers, setTotalPoints, setPointsRedeemed]);

    return (
        <div>
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Current Points
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Points History
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Expiry Information
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCustomers?.map(customer => {
                                // Compute totals from history
                                const totalEarned = customer.history
                                    ?.filter(h => h.type === "earned")
                                    .reduce((sum, h) => sum + h.amount, 0) || 0;

                                const totalRedeemed = customer.history
                                    ?.filter(h => h.type === "redeemed")
                                    .reduce((sum, h) => sum + h.amount, 0) || 0;

                                // console.log("Total Earned:", totalEarned);   // 400
                                // console.log("Total Redeemed:", totalRedeemed); // 0

                                const orders = new Set(
                                    customer.history?.map(h => h.description?.match(/Order (\w+)/)?.[1])
                                ).size;

                                const daysUntilExpiry = calculateDaysUntilExpiry(customer?.createdAt);
                                const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

                                return (
                                    <tr key={customer?._id} className="hover:bg-gray-50">
                                        {/* Customer Info */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{customer?.userId?.name}</div>
                                                <div className="text-sm text-gray-500">{customer?.userId?.email}</div>
                                                <div className="text-xs text-gray-400">
                                                    {customer?.userId?.address ? (
                                                        [
                                                            customer.userId.address.street,
                                                            customer.userId.address.city,
                                                            customer.userId.address.state,
                                                            customer.userId.address.country,
                                                            customer.userId.address.zipCode,
                                                        ].filter(Boolean).join(", ")
                                                    ) : "No address available"}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Current Points */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-lg font-bold text-green-600">{customer?.points?.toLocaleString()}</div>
                                            <div className="text-sm text-green-700 font-medium">
                                                Value: ₹{(customer?.points * 0.5).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Active since: {new Date(customer?.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>

                                        {/* History Summary */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-gray-500">Total Earned:</span>
                                                    <span className="font-medium text-blue-600">{totalEarned?.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-gray-500">Total Redeemed:</span>
                                                    <span className="font-medium text-orange-600">{totalRedeemed?.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Orders:</span>
                                                    <span className="font-medium">{orders}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Expiry */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {daysUntilExpiry > 0 ? (
                                                <div>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${isExpiringSoon ? 'bg-red-700 text-white' : 'bg-green-700 text-white'}`}>
                                                        {daysUntilExpiry} days left
                                                    </span>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Expires on: {new Date(new Date(customer?.createdAt).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-white">
                                                    Expired
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Button
                                                onClick={() => {
                                                    setSelectedCustomer(customer);
                                                    setShowCustomerModal(true);
                                                }}
                                                className="bg-blue-700 text-white hover:bg-blue-900 text-xs px-3 py-1"
                                            >
                                                <i className="ri-edit-line mr-1"></i>
                                                Manage Points
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <div className="flex space-x-2">
                        <Button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-700 text-white disabled:opacity-50 hover:bg-gray-900"
                        >
                            Previous
                        </Button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <Button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-4 py-2 ${currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-white hover:bg-gray-900'}`}
                            >
                                {page}
                            </Button>
                        ))}

                        <Button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-700 text-white disabled:opacity-50 hover:bg-gray-900"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ManagementRewordTable
