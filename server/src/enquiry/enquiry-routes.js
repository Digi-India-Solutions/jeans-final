const express = require("express");
const {
  createEnquiry,
  getAllEnquiries,
//   changeStatus,
//   getEnquiryByID,
//   updateEnquiryByID,
  deleteEnquiryByID,
  getEnquiryList
} = require("./enquiry-contriller");

const router = express.Router();

router.post("/create-enquiry", createEnquiry);
router.get("/get-all-enquiries", getAllEnquiries);
// router.post("/change-status", changeStatus);
// router.get("/get_enquiry_by_id/:id", getEnquiryByID);
// router.post("/update-enquiry/:id", updateEnquiryByID);
router.get("/delete-enquiry/:id", deleteEnquiryByID);
router.get("/get_all_enquiry_list", getEnquiryList);

module.exports = router;
