import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import HomePage from "../pages/home/page";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "../pages/ProtectedRoute"; // ✅ use this

// Admin Pages
import AdminDashboard from "../pages/admin/dashboard/page";
import OrdersManagement from "../pages/admin/orders/page";
import RecycledOrderManagement from "../pages/admin/recycledOrder/page";
import ReturnsAndChallan from "../pages/admin/returns/page";
import SalesReports from "../pages/admin/sales/page";
import MarketingPage from "../pages/admin/marketing/page";
import EnquiriesPage from "../pages/admin/enquiries/page";
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
import UserRolesManagement from "../pages/admin/user-roles/page";
import ChallanCreate from "../pages/admin/challan/create/page";
import CartsManagement from "../pages/admin/application/cart/page";
import TermAndCondition from "../pages/admin/termAndCondition/page.jsx";
import Categorys from "../pages/website/category/page.jsx"
import SubCategorys from "../pages/website/subCategorys/page.jsx"
import Products from "../pages/website/product/page.jsx"
import SubProducts from "../pages/website/subProduct/page.jsx"
import ProductDeatils from "../pages/website/productDetails/page.jsx"
import BlankPage from "../pages/admin/blanckPage/page.jsx"

const CatalogueUpload = lazy(() => import('../pages/admin/catalogue/page'));

const routes: RouteObject[] = [
  // ✅ Public routes
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <Login /> },
  { path: "/admin/reset-password/:token", element: <ResetPassword /> },
  { path: "/main-category", element: <Categorys /> },
  { path: "/sub-category/:name", element: <SubCategorys /> },
  { path: "/products/:name", element: <Products /> },
  { path: "/sub-products/:name", element: <SubProducts /> },
  { path: "/product-details/:name", element: <ProductDeatils /> },

  // ✅ Protected admin routes — auth checked inside ProtectedRoute
  {
    path: "/admin",
    element: <ProtectedRoute />, // ← wraps all admin routes
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
      { path: "catalogue", element: <CatalogueUpload /> },
      { path: "term-and-condition", element: <TermAndCondition /> },
      { path: "blank_page", element: <BlankPage /> },



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

  { path: "*", element: <NotFound /> },
];

export default routes;
