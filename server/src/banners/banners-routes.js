const { Router } = require("express");
const router = Router();
const upload =  require('../../middleware/multer')
// const multer = require("multer");
// const { v4: uuidv4 } = require('uuid');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "./uploads/banners-images");
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${uuidv4()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`);
//     },
// });

// const upload = multer({ storage: storage });

const { createBanners, updateBanner, deleteBanner, changeStatus, getAllBanners, getSingleBanner } = require("./banners-controller");


router.get("/", getAllBanners);
router.get("/get/:id", getSingleBanner);

router.post("/create", upload.single("images"), createBanners);
router.post("/update/:id", upload.single("images"), updateBanner);
router.get("/delete/:id", deleteBanner);
router.post("/change-status", changeStatus);

module.exports = router;