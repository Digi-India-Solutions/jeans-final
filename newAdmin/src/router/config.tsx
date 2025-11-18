import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import HomePage from "../pages/home/page";
import NotFound from "../pages/NotFound";

// Admin Pages
import AdminDashboard from "../pages/admin/dashboard/page";
import OrdersManagement from "../pages/admin/orders/page";
import RecycledOrderManagement from "../pages/admin/recycledOrder/page";
import ReturnsAndChallan from "../pages/admin/returns/page";
import SalesReports from "../pages/admin/sales/page";
import MarketingPage from "../pages/admin/marketing/page";
import EnquiriesPage from "../pages/admin/enquiries/page";

// Application Management
import CategoriesManagement from "../pages/admin/application/categories/page";
import SubCategoriesManagement from "../pages/admin/application/subcategories/page";
import ProductsManagement from "../pages/admin/application/products/page";
import SubProductsManagement from "../pages/admin/application/sub-products/page";
import UsersManagement from "../pages/admin/users/page";
import WishlistManagement from "../pages/admin/application/wishlist/page";
import SizesManagement from "../pages/admin/application/sizes/page";
import CouponsManagement from "../pages/admin/application/coupons/page";
import BannersManagement from "../pages/admin/application/banners/page";
import VideosManagement from "../pages/admin/application/videos/page";
import NotificationsManagement from "../pages/admin/application/notifications/page";
import RewardsManagement from "../pages/admin/application/rewards/page";
import FaqsManagement from "../pages/admin/application/faqs/page";
import Login from "../components/auth/Login";
import ResetPassword from "../components/auth/ResetPassword";
// User & Role Management
import UserRolesManagement from "../pages/admin/user-roles/page";
// Challan Management
import ChallanCreate from "../pages/admin/challan/create/page";
import CartsManagement from "../pages/admin/application/cart/page"

const CatalogueUpload = lazy(() => import('../pages/admin/catalogue/page'));

// Check login status
const login = sessionStorage.getItem("login");
console.log("Login status:=>", login);
// Common routes
const commonRoutes: RouteObject[] = [
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <Login /> },
  { path: "/admin/reset-password/:token", element: <ResetPassword /> },
  { path: "*", element: <NotFound /> },
];

// Admin routes (only if logged in)
const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    children: [
      { path: "", element: <AdminDashboard /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "orders", element: <OrdersManagement /> },
      { path: "recycledOrder", element: <RecycledOrderManagement /> },
      { path: "returns", element: <ReturnsAndChallan /> },
      { path: "sales", element: <SalesReports /> },
      { path: "marketing", element: <MarketingPage /> },
      { path: "enquiries", element: <EnquiriesPage /> },
      { path: "user-roles", element: <UserRolesManagement /> },
      { path: "users", element: <UsersManagement /> },
      { path: '/admin/catalogue', element: <CatalogueUpload /> },
      {
        path: "application",
        children: [
          { path: "categories", element: <CategoriesManagement /> },
          { path: "subcategories", element: <SubCategoriesManagement /> },
          { path: "products", element: <ProductsManagement /> },
          { path: "sub-products", element: <SubProductsManagement /> },
          { path: "cart", element: <CartsManagement /> },
          { path: "wishlist", element: <WishlistManagement /> },
          { path: "sizes", element: <SizesManagement /> },
          { path: "coupons", element: <CouponsManagement /> },
          { path: "banners", element: <BannersManagement /> },
          { path: "videos", element: <VideosManagement /> },
          { path: "notifications", element: <NotificationsManagement /> },
          { path: "rewards", element: <RewardsManagement /> },
          { path: "faqs", element: <FaqsManagement /> },
        ],
      },
      {
        path: "challan",
        children: [{ path: "create", element: <ChallanCreate /> }],
      },
    ],
  },
];

// Merge routes based on login
const routes: RouteObject[] = login ? [...commonRoutes, ...adminRoutes] : [...commonRoutes];

export default routes;
