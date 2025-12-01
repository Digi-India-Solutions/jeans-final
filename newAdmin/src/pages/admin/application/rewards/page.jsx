
"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../../../../components/feature/AdminLayout";
import Card from "../../../../components/base/Card";
import Button from "../../../../components/base/Button";
import ManagementRewordPoint from "./ManagementRewordPoint";
import ManageSingupReward from "./ManageSingupReward";
import ManagementRewordTable from "./ManagementRewordTable";
import { getData } from "../../../../services/FetchNodeServices";


export default function RewardsManagement() {

  const [customers, setCustomers] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingReward, setEditingReward] = useState(null);
  const [activeTab, setActiveTab] = useState("customers");
  const [signUpReward, setSignUpReward] = useState(0)
  const [filters, setFilters] = useState({ search: '', type: '' });
  const [pointsRedeemed, setPointsRedeemed] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [pointsForm, setPointsForm] = useState({ points: "", reason: "", type: "add" });
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [rewardForm, setRewardForm] = useState({ name: "", pointsCost: "", type: "Discount", value: "", description: "", validDays: "", status: "Active" });


  // const fetchCustomers = async () => {
  //   try {
  //     const response = await getData("api/user/get-all-user");
  //     if (response.success) {
  //       setCustomers(response.data);
  //     }
  //   } catch (error) {
  //     console.error("Fetch users error:", error);
  //   }
  // }

  // useEffect(() => {
  //   fetchCustomers();
  // }, [])

  useEffect(() => {
    fetchRewards();
    fetchSignUpReward();
  }, [currentPage]);

  // 🔹 Fetch All User Rewards
  const fetchRewards = async () => {
    try {
      const response = await getData("api/reward/get-All-rewards");
      // const response = await getData(`api/reward/get-All-rewards-with-pagination?page=${currentPage}&limit=10`)
      // console.log("GGGGGGGGGGGGG:==>", response)
      if (response?.success) {
        setCustomers(response?.rewards);
        setTotalPages(response?.totalPages)
      }
    } catch (error) {
      console.error("Error fetching rewards:", error);
      // toast.error("Server error while fetching rewards");
    }
  };

  // 🔹 Fetch SignUp Reward (only one record usually)
  const fetchSignUpReward = async () => {
    try {
      const response = await getData("api/reward/get-fist-time-signup-reward");
      if (response?.success) {
        setSignUpReward(response.data?.[0] || null);
        // setFormData(response.data?.[0] || null)
      }
    } catch (error) {
      console.error("Signup reward fetch error:", error);
    }
  };

  const filteredCustomers = customers

  const searchReword = async () => {
    if (filters.search) {
      try {
        const response = await getData(
          `api/reward/search-reword-by-admin-with-pagination?page=${currentPage}&limit=10&search=${filters?.search}`
        );
        console.log('FFFFFFF:==>', response)
        if (response?.success) {
          setCustomers(response?.rewards);
          setTotalPages(response?.totalPages)
        }
      } catch (error) {
        console.error("Error fetching filtered rewards:", error);
      }
    }
  };

  useEffect(() => {
    searchReword();
  }, [filters.search]);

  /** ----------------- Render ----------------- */
  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Left Section */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Rewards</h1>
            <p className="text-gray-600 mt-1">
              Manage customer points and reward options
            </p>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* <Button variant="outline" size="md" className="flex items-center gap-2">
              <i className="ri-download-line"></i>
              Export Report
            </Button> */}

            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowRewardModal(true)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <i className="ri-edit-line mr-1"></i>
              Edit Signup Reward
            </Button>
          </div>
        </div>


        {/* Tabs */}
        {/* <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "customers"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Customer Points
          </button>
        </div> */}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="p-6 flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <i className="ri-user-line text-xl text-blue-600"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold">{customers.length}</p>
                </div>
              </Card>
              <Card className="p-6 flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <i className="ri-coin-line text-xl text-green-600"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Points</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalPoints}
                  </p>
                </div>
              </Card>
              <Card className="p-6 flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <i className="ri-gift-line text-xl text-purple-600"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Points Redeemed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pointsRedeemed}
                  </p>
                </div>
              </Card>

              <Card className="p-6 flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <i className="ri-user-line text-xl text-black-600"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Fist Time Sing-Up Points </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {signUpReward?.points?.toLocaleString()}
                  </p>
                </div>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                      type="text"
                      placeholder="Name, email, business name, address..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                    <div className="relative">
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                      >
                        <option value="">All Types</option>
                        <option value="B2B">B2B</option>
                        <option value="Retail">Retail</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div> */}
                </div>
              </div>
            </Card>

            {/* Customer Table */}
            <ManagementRewordTable
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
              totalPoints={totalPoints}
              pointsRedeemed={pointsRedeemed}
              setTotalPoints={setTotalPoints}
              setPointsRedeemed={setPointsRedeemed}
              setSelectedCustomer={setSelectedCustomer}
              filteredCustomers={filteredCustomers}
              setShowCustomerModal={setShowCustomerModal}
              
            />

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <i className="ri-user-line text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">No customers found matching your criteria</p>
              </div>
            )}
          </>
        )}


        {/* Customer Points Modal */}
        {showCustomerModal && selectedCustomer && (
          <ManagementRewordPoint
            setCustomers={setCustomers}
            customers={customers}
            setSelectedCustomer={setSelectedCustomer}
            setShowCustomerModal={setShowCustomerModal}
            selectedCustomer={selectedCustomer}
            setPointsForm={setPointsForm}
            pointsForm={pointsForm}
fetchRewards={fetchRewards}
          />
        )}

        {/* Reward Modal */}
        {showRewardModal && (
          <ManageSingupReward
            setShowRewardModal={setShowRewardModal}
            showRewardModal={showRewardModal}
            setRewardForm={setRewardForm}
            editingReward={editingReward}
            rewardForm={rewardForm}
            setEditingReward={setEditingReward}
            signUpReward={signUpReward}
            setSignUpReward={setSignUpReward}
            fetchSignUpReward={fetchSignUpReward}
          />
        )}
      </div>
    </AdminLayout>
  );
}
