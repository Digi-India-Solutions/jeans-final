import React from 'react'
import { Route, Routes } from 'react-router-dom'

import Header from '../Header/Header'
import Dashboard from '../../Pages/Dashboard/Dashboard'
import AllProduct from '../../Pages/Products/AllProduct'
import AddProduct from '../../Pages/Products/AddProduct'
import AllFaq from '../../Pages/Faq/AllFaq'
import AddFaq from '../../Pages/Faq/AddFaq'
import AllOrder from '../../Pages/Orders/AllOrder'
import EditOrder from '../../Pages/Orders/EditOrder'
import AllUsers from '../../Pages/Users/AllUsers'
import AllColor from '../../Pages/Color/AllColor'
import AddColor from '../../Pages/Color/AddColor'
import EditColor from '../../Pages/Color/EditColor'
import AllSize from '../../Pages/Size/AllSize'
import AddSize from '../../Pages/Size/AddSize'
import EditSize from '../../Pages/Size/EditSize'
import AllFlavour from '../../Pages/Flavour/AllFlavour'
import AddFlavour from '../../Pages/Flavour/AddFlavour'
import EditFlavour from '../../Pages/Flavour/EditFlavour'
import AllSBanner from '../../Pages/Banner/AllSBanner'
import AddBanner from '../../Pages/Banner/AddBanner'
import EditBanner from '../../Pages/Banner/EditBanner'
import EditProduct from '../../Pages/Products/EditProduct '
import Login from '../auth/Login'
import AllDieses from '../../Pages/Dieses/AllDieses'
import AddCategory from '../../Pages/Dieses/AddCategory'
import EditCategory from '../../Pages/Dieses/EditCategory'
import AddCoupen from '../../Pages/Coupen/AddCoupen'
import AllCoupen from '../../Pages/Coupen/AllCoupen'
import EditCoupen from '../../Pages/Coupen/EditCoupen'
import AllReviews from '../../Pages/Reviews/AllReviews'
import AllCard from '../../Pages/Card/AllCard'
import ResetPassword from '../auth/ResetPassword'
import { elements } from 'chart.js'
import AllWishList from '../../Pages/WishList/AllWishList'
import AllRewardPoint from '../../Pages/RewardPoints/AllRewardPoint'
import ViewDetails from '../../Pages/RewardPoints/ViewDetails'
import AllVideios from '../../Pages/VideoUrl/AllVideios'
import AddVideos from '../../Pages/VideoUrl/AddVideios'
import EditVideios from '../../Pages/VideoUrl/EditVideios'
import ShowDetails from '../../Pages/Card/ShowDetails'
import EditFaq from '../../Pages/Faq/EditFaq'
import AllSubProduct from '../../Pages/SubProduct/AllSubProduct'
import AddSubProduct from '../../Pages/SubProduct/AddSubProduct'
import EditSubProduct from '../../Pages/SubProduct/EditSubProduct'

const Home = () => {

  const login = sessionStorage.getItem("login")

  return (
    <>

      {
        login ? (
          <>
            <Header />
            <div className="rightside">
              <Routes>
                <Route path={"/"} element={<Dashboard />} />

                {/* Color */}
                <Route path={"/all-color"} element={<AllColor />} />
                <Route path={"/add-color"} element={<AddColor />} />
                <Route path={"/edit-color/:id"} element={<EditColor />} />

                {/* Size */}
                <Route path={"/all-size"} element={<AllSize />} />
                <Route path={"/add-size"} element={<AddSize />} />
                <Route path={"/edit-size/:id"} element={<EditSize />} />

                {/* Flover */}
                <Route path={"/all-flower"} element={<AllFlavour />} />
                <Route path={"/add-flover"} element={<AddFlavour />} />
                <Route path={"/edit-flover/:id"} element={<EditFlavour />} />

                {/* Product --  */}
                <Route path={"/all-products"} element={<AllProduct />} />
                <Route path={"/add-product"} element={<AddProduct />} />
                <Route path={"/edit-product/:id"} element={<EditProduct />} />

                {/* Sub Product --  */}
                <Route path={"/all-Sub-products"} element={<AllSubProduct />} />
                <Route path={"/add-Sub-products"} element={<AddSubProduct />} />
                <Route path={"/edit-Sub-products/:id"} element={<EditSubProduct />} />

                {/* Category --  */}
                <Route path={"/all-dieses"} element={<AllDieses />} />
                <Route path={"/add-category"} element={<AddCategory />} />
                <Route path={"/edit-category/:id"} element={<EditCategory />} />

                {/* --- Orders --- */}
                <Route path={"/all-users"} element={<AllUsers />} />

                {/* --- faq --- */}
                <Route path={"/all-faq"} element={<AllFaq />} />   {/* // All Vouchers */}
                <Route path={"/add-faq"} element={<AddFaq />} />
                <Route path={"/edit-faq/:id"} element={<EditFaq />} />



                {/* --- Banners --- */}
                <Route path={"/all-banners"} element={<AllSBanner />} />
                <Route path={"/add-banner"} element={<AddBanner />} />
                <Route path={"/edit-banner/:id"} element={<EditBanner />} />

                {/* --- Orders --- */}
                <Route path={"/all-orders"} element={<AllOrder />} />
                <Route path={"/order-details/:id"} element={<EditOrder />} />

                <Route path={"/all-coupen"} element={<AllCoupen />} />
                <Route path={"/edit-coupon/:id"} element={<EditCoupen />} />
                <Route path={"/add-coupen"} element={<AddCoupen />} />

                {/* all-Reviews */}
                <Route path={'all-reviews'} element={<AllReviews />} />
                <Route path={'all-cards'} element={<AllCard />} />
                <Route path={'/show-detail'} element={<ShowDetails />} />

                <Route path={"/all-wishlist"} element={<AllWishList />} />
                <Route path={"all-rewardPoint"} element={<AllRewardPoint />} />
                <Route path={"View-Details"} element={<ViewDetails />} />
                {/* all-HomePage-Videos-Url */}
                <Route path={"add-videos"} element={<AddVideos />} />
                <Route path={"all-videos"} element={<AllVideios />} />
                <Route path={"edit-videos/:id"} element={<EditVideios />} />
              </Routes>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/*" element={<Login />} />
            <Route path="/admin/reset-password/:token" element={<ResetPassword />} />
          </Routes>
        )}
    </>
  )
}

export default Home