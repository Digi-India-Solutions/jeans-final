const { Router } = require("express");
const router = Router();
const upload = require("../../middleware/multer");

const {
	createBanners,
	updateBanner,
	deleteBanner,
	changeStatus,
	getAllBanners,
	getSingleBanner,
} = require("./banners-controller");

router.get("/get-all-banners", getAllBanners);
router.get("/get-single-banner/:id", getSingleBanner);

router.post("/create-banner", upload.single("images"), createBanners);
router.put("/update-banner/:id", upload.single("images"), updateBanner);
router.delete("/delete-banner/:id", deleteBanner);
router.post("/change-status", changeStatus);

module.exports = router;