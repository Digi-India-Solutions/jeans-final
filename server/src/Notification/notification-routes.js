const express = require("express");
const router = express.Router();
const { createNotification, getAllNotifications, getNotificationById,updateNotificationById, deleteNotification ,resendNotification } = require("./notification-controller");
const upload = require("../../middleware/multer");

// const { sendOtpToUserSignup, verifyOtpToUserSignup, userLogin, sendResetPasswordEmail, resetPassword,
//     getAllUser, getUserById, deleteUser, updateUserWithPhoto, changePassword, updateUser,
//     sendMessageWhatsapp, toggleStatusUserId, bulkOrderNotification,getUsersWithoutOrders } = require("./users-controller");

router.post("/create-notification", upload.single("image"), createNotification);
router.get("/get-all-notification", getAllNotifications);
router.get("/get-notification-by-id/:id", getNotificationById);
router.post("/update-notification/:id", upload.single("image"), updateNotificationById);
router.get("/delete-notification/:id", deleteNotification);
router.get("/resend-notification/:id", resendNotification);

module.exports = router;