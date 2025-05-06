require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const app = express();

// built-in middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));
app.use(express.urlencoded({ limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname + "/uploads")));
app.use("/Public", express.static(path.join(__dirname + "/Public")));
// app.set(express.static("./Public"));

const superAdminRoutes = require("./src/super-admin/super-admin-routes");
const bannerRoutes = require("./src/banners/banners-routes");
const productRoutes = require("./src/products/products-routes");
const subProductRoutes = require("./src/subProducts/subProducts-routes");
const categoryRoutes = require("./src/categorys/categorys.routes");
const sizeRoutes = require("./src/sizes/sizes-routes");
const colorRoutes = require("./src/colors/colors-routes");
const wishListRoutes = require("./src/wishLists/wishList-routes");
const usersRoutes = require("./src/users/users-routes");
const couponRoutes = require("./src/coupons/coupons-routes")
const rewardPointsRoutes = require("./src/rewordsPoints/rewordsPoints-routes")
const videosUrlRoutes = require("./src/videosUrl/videosUrl-routes")
const orderRoutes = require("./src/orders/orders-routes");
const cardRoutes = require("./src/addToCard/card-routers")
const faqRoutes = require("./src/faq/faq-routes")
const reviewRoutes = require("./src/Reviews/review-routes")

app.use("/api/admin", superAdminRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/product", productRoutes);
app.use("/api/subProduct", subProductRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/size", sizeRoutes);
app.use("/api/color", colorRoutes);
app.use("/api/wishlist", wishListRoutes);
app.use("/api/user", usersRoutes);
app.use("/api/coupon", couponRoutes)
app.use("/api/reward", rewardPointsRoutes)
app.use("/api/video", videosUrlRoutes)
app.use("/api/order", orderRoutes);
app.use("/api/card", cardRoutes)
app.use("/api/faq", faqRoutes)
app.use("/api/review", reviewRoutes)

const connectDatabase = require("./db/database");

//connect db
connectDatabase();
// sendBillingToClient();
app.use("/",(req,res)=>{
 return res.send("app is running")
})

//create server//
const server = app.listen(process.env.PORT || 8000, () => {
  console.log("Server is running on port", process.env.PORT || 8000);
});
