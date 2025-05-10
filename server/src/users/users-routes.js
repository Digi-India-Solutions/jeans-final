const express = require("express");
const router = express.Router();
const upload = require("../../middleware/multer")

const { sendOtpToUserSignup, verifyOtpToUserSignup, userLogin, sendResetPasswordEmail, resetPassword,
    getAllUser, getUserById, deleteUser, updateUserWithPhoto, changePassword, updateUser,
    sendMessageWhatsapp } = require("./users-controller");

router.post("/send-otp-for-user-signup", sendOtpToUserSignup);

router.post("/verify-otp-for-user-signup", verifyOtpToUserSignup)

router.post("/user-login", userLogin)

router.post("/send-reset-password-email", sendResetPasswordEmail)

router.post("/reset-password", resetPassword)

router.get('/get-all-user', getAllUser);

router.get('/get-all-user-by-id/:id', getUserById);

router.get("/delete-user/:id", deleteUser)

router.post("/update-user-with-photo/:id", upload.single("photo"), updateUserWithPhoto);

router.post("/change-password-user/:id", changePassword);

router.post("/update-user/:id", updateUser);

router.post("/send-message-whatsapp", sendMessageWhatsapp);
module.exports = router;