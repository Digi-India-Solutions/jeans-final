const { Router } = require("express");
const router = Router();
const upload =  require('../../middleware/multer')

const { uploadPdf,getAllCataloguePdf,getAllCataloguePdfWithPagination } = require("./catalogues-controller");



router.post("/uploadPdf", upload.single("file"), uploadPdf);
router.get("/get-all-catalogue-pdf", getAllCataloguePdf);
router.get("/get-all-catalogue-pdf-with-pagination",  getAllCataloguePdfWithPagination);


module.exports = router;