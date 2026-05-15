import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Categorys from "../pages/website/category/page.jsx"
import SubCategorys from "../pages/website/subCategorys/page.jsx"
import Products from "../pages/website/product/page.jsx"
import SubProducts from "../pages/website/subProduct/page.jsx"
import ProductDeatils from "../pages/website/productDetails/page.jsx"


const routes: RouteObject[] = [
  // ✅ Public routes
  { path: "/", element: <Categorys /> },
  { path: "/sub-category/:name", element: <SubCategorys /> },
  { path: "/products/:name", element: <Products /> },
  { path: "/sub-products", element: <SubProducts /> },
  { path: "/product-details/:name", element: <ProductDeatils /> },
  { path: "*", element: <NotFound /> },
];

export default routes;
