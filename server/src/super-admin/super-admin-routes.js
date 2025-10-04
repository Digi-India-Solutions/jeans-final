const express = require('express');
const router = express.Router();

const { createSuperAdmin, updateSuperAdminByID, superAdminLogin, changePassword, sendOtpForChangeEmail, verifyOtpForChangeEmail,
    sendResetPasswordEmail, resetPassword, sendOtpForChangePhone, verifyOtpForChangePhone, createAdminByAdmin,
    getAdminUsersByAdminwithPagination, updateAdminByAdmin, deleteAdminUserByAdmin } = require("./super-admin-controller.js");

router.post("/create-admin", createSuperAdmin);

router.post("/admin-login", superAdminLogin);

router.post("/send-reset-password-email", sendResetPasswordEmail);

router.post("/reset-password", resetPassword);
/////////////////////////////////////// crud operation by admin ////////////////////////////////////////////////////
router.post("/create-admin-by-admin", createAdminByAdmin);

router.get("/getAdminUsersByAdminwithPagination", getAdminUsersByAdminwithPagination);

router.post("/update-admin-by-admin/:id", updateAdminByAdmin);

router.get("/delete-admin-user-by-admin/:id", deleteAdminUserByAdmin);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// router.post("/update-super-admin/:id", updateSuperAdminByID);

// router.post("/change-password-super-admin/:id", changePassword);

// router.post("/send-otp-for-change-email", sendOtpForChangeEmail);

// router.post("/verify-otp-for-change-email", verifyOtpForChangeEmail);

// router.post("/send-otp-for-change-phone", sendOtpForChangePhone);

// router.post("/verify-otp-for-change-phone", verifyOtpForChangePhone);


module.exports = router;