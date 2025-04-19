const express = require("express");
const router = express.Router();
// const authenticate = require("../../middleware/auth");
const { sendOtpToUserSignup, verifyOtpToUserSignup, userLogin, sendResetPasswordEmail,resetPassword ,getAllUser,getUserById,deleteUser} = require("./users-controller");

router.post("/send-otp-for-user-signup", sendOtpToUserSignup);

router.post("/verify-otp-for-user-signup", verifyOtpToUserSignup)

router.post("/user-login", userLogin)

router.post("/send-reset-password-email", sendResetPasswordEmail)

router.post("/reset-password", resetPassword)

router.get('/get-all-user', getAllUser);

router.get('/get-all-user-by-id/:id', getUserById);

router.get("/delete-user/:id" , deleteUser)
module.exports = router;