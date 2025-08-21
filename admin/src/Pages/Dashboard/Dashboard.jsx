import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import { getData } from "../../services/FetchNodeServices";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userWishlists, setUserWishlists] = useState([]);
  const [rewardPoints, setRewardPoints] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupones, setCoupones] = useState([]);
  const [enquiry, setEnquiry] = useState([]);
  const [notification, setNotification] = useState([]);
  const [orders, setOrders] = useState([]);
  const [daySales, setDaySales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          usersRes,
          bannersRes,
          categoriesRes,
          wishlistRes,
          productsRes,
          rewardsRes,
          couponsRes,
          enquiryRes,
          ordersRes,
          notificationRes
        ] = await Promise.all([
          getData("api/user/get-all-user"),
          getData("api/banner"),
          getData("api/category/get-all-categorys-with-pagination"),
          getData("api/wishlist/get-all-size-with-pagination"),
          getData("api/product/get-all-products-with-pagination"),
          getData("api/reward/get-All-rewards"),
          getData("api/coupon/get-All-coupons"),
          getData("api/enquiry/get_all_enquiry_list"),
          getData("api/order/get-all-orders"),
          getData("api/notification/get-all-notification")
        ]);

        if (usersRes?.success) setUsers(usersRes.data);
        if (bannersRes?.success) setBanners(bannersRes.data);
        if (categoriesRes?.success) setCategories(categoriesRes.data);
        if (wishlistRes?.success) setUserWishlists(wishlistRes.data);
        if (productsRes?.success) setProducts(productsRes.data || []);
        if (rewardsRes?.success) setRewardPoints(rewardsRes.rewards || []);
        if (couponsRes?.success) setCoupones(couponsRes.coupons || []);
        if (enquiryRes?.status === true) setEnquiry(enquiryRes.data || []);
        if (notificationRes?.success) setNotification(notificationRes.data);
        if (ordersRes?.success) {
          setOrders(ordersRes.orders);
          setDaySales(ordersRes.orders); // using same data for now
        }

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare chart data
  const daySalesData = {
    labels: daySales.map(order => new Date(order.createdAt).toLocaleDateString()),
    datasets: [{
      label: "Sales",
      data: daySales.map(order => order?.totalAmount || 0),
      borderColor: "#36a2eb",
      fill: false,
      tension: 0.3
    }]
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to Anibhavi Creation Admin Panel</h1>
        <p>Manage your Anibhavi Creation store data from here!</p>
      </div>

      {loading ? (
        <p className="text-center">Loading Dashboard Data...</p>
      ) : (
        <>
          <div className="dashboard-cards">
            <DashboardCard to="/all-orders" icon="fa-truck" title="Manage Orders" count={orders.length} />
            <DashboardCard to="/all-banners" icon="fa-images" title="Manage Banners" count={banners.length} />
            <DashboardCard to="/all-category" icon="fa-virus" title="Manage Categories" count={categories.length} />
            <DashboardCard to="/all-wishlist" icon="fa-heartbeat" title="User Wishlists" count={userWishlists.length} />
            <DashboardCard to="/all-rewardPoint" icon="fa-star" title="Manage Reviews" count={rewardPoints.length} />
            <DashboardCard to="/all-products" icon="fa-boxes-stacked" title="Manage Products" count={products.length} />
            <DashboardCard to="/all-users" icon="fa-users" title="All Users" count={users.length} />
            <DashboardCard to="/all-coupen" icon="fa-tags" title="All Coupons" count={coupones.length} />
            <DashboardCard to="/all-enquiry" icon="fa-envelope-open-text" title="All Enquiries" count={enquiry.length} />
            <DashboardCard to="/all-notification" icon="fa-solid fa-bell" title="All Notification" count={notification?.length} />
          </div>

          {/* Sales Chart */}
          {/* <div className="dashboard-chart mt-5">
            <h3>Day-by-Day Sales Overview</h3>
            {daySales.length > 0 ? (
              <Line data={daySalesData} />
            ) : (
              <p>No sales data available.</p>
            )}
          </div> */}
        </>
      )}
    </div>
  );
};

// Reusable Card Component
const DashboardCard = ({ to, icon, title, count }) => (
  <div className="dashboard-card">
    <Link to={to}>
      <i className={`fa-solid ${icon}`}></i>
      <h3>{title}</h3>
      <p>{count} {title.includes("All") ? "" : title.split(" ")[1]}</p>
    </Link>
  </div>
);

export default Dashboard;
