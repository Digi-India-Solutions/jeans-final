const Notification = require("./notification-model");
const fs = require("fs");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const { uploadImage, deleteImage } = require("../../middleware/Uploads");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder");
const User = require("../users/users-model");

// CREATE Notification
exports.createNotification = catchAsyncErrors(async (req, res, next) => {
    try {
        const { title, body } = req.body;
        if (!title || !body) {
            return res.status(400).json({ success: false, message: "All fields required" });
        }

        let imageUrl = null;
        if (req.file) {
            const localImagePath = req.file.path;
            imageUrl = await uploadImage(localImagePath);
            deleteLocalFile(localImagePath);
        }

        const notification = new Notification({
            title,
            body,
            image: imageUrl,
        });

        await notification.save();
        res.json({ success: true, message: "Notification created successfully", data: notification });
    } catch (error) {
        console.error("Create Notification Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

exports.createNotificationWithoutImage = catchAsyncErrors(async (req, res, next) => {
    try {
        const { title, body } = req.body;
        if (!title || !body) {
            return res.status(400).json({ success: false, message: "All fields required" });
        }
        const notification = new Notification({ title, body, });

        await notification.save();
        res.json({ success: true, message: "Notification created successfully", data: notification });
    } catch (error) {
        console.error("Create Notification Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
// GET All Notifications
exports.getAllNotifications = catchAsyncErrors(async (req, res, next) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error("Get All Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// GET Single Notification
exports.getNotificationById = catchAsyncErrors(async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
        res.json({ success: true, data: notification });
    } catch (error) {
        console.error("Get By ID Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// UPDATE Notification
exports.updateNotificationById = catchAsyncErrors(async (req, res, next) => {
    try {
        const { title, body } = req.body;
        const { id } = req.params;
        // Find notification
        const notification = await Notification.findById(id);
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        if (title) notification.title = title;
        if (body) notification.body = body;

        if (req.file) {
            const localImagePath = req.file.path;
            if (notification.image) {
                try {
                    await deleteImage(notification.image);
                } catch (err) {
                    console.warn("Old image deletion failed:", err.message);
                }
            }
            const uploadedUrl = await uploadImage(localImagePath);
            await deleteLocalFile(localImagePath);
            notification.image = uploadedUrl;
        }

        await notification.save();

        return res.status(200).json({ success: true, message: "Notification updated successfully", data: notification, });
    } catch (error) {
        console.error("Update Notification Error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// exports.updateNotificationWitoutImageById = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { title, body } = req.body;
//         const { id } = req.params;
//         // Find notification
//         const notification = await Notification.findById(id);
//         if (!notification) {
//             return res.status(404).json({ success: false, message: "Notification not found" });
//         }

//         if (title) notification.title = title;
//         if (body) notification.body = body;

//         if (req.file) {
//             const localImagePath = req.file.path;
//             if (notification.image) {
//                 try {
//                     await deleteImage(notification.image);
//                 } catch (err) {
//                     console.warn("Old image deletion failed:", err.message);
//                 }
//             }
//             const uploadedUrl = await uploadImage(localImagePath);
//             await deleteLocalFile(localImagePath);
//             notification.image = uploadedUrl;
//         }

//         await notification.save();

//         return res.status(200).json({ success: true, message: "Notification updated successfully", data: notification, });
//     } catch (error) {
//         console.error("Update Notification Error:", error);
//         return res.status(500).json({ success: false, message: "Server error", error: error.message });
//     }
// });



// DELETE Notification
exports.deleteNotification = catchAsyncErrors(async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        if (notification.image) {
            try {
                await deleteImage(notification.image);
            } catch (err) {
                console.warn("Old image deletion failed:", err.message);
            }
        }

        await Notification.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: "Notification deleted successfully" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// const { GoogleAuth } = require("google-auth-library");
// const admin = require("firebase-admin");
// const path = require("path");

// // ✅ Correct path to your service account
// const serviceAccountPath = path.join(__dirname, "../../firebase-service-account.json");

// // ✅ Initialize Firebase only once
// if (!admin.apps.length) {
//     admin.initializeApp({
//         credential: admin.credential.cert(require(serviceAccountPath)),
//     });
// }

// // 🔑 Function to get OAuth2 access token
// async function getAccessToken() {
//     const auth = new GoogleAuth({
//         keyFile: serviceAccountPath, // service account JSON file
//         scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
//     });
//     const client = await auth.getClient();
//     const accessToken = await client.getAccessToken();
//     return accessToken.token;
// }

// exports.resendNotification = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const projectId = "anibhavicreation-95213";
//         const accessToken = await getAccessToken();
//         const notificationExist = Notification.find({ _id: req.params.id });
//         if (!notificationExist) {
//             return res.status(404).json({ success: false, message: "Notification not found" });
//         }
//         const inactiveUsers = await User.find({ fcmToken: { $exists: true, $ne: null }, }).select("name email phone fcmToken");
//         console.log("notificationExist==>", notificationExist, req.params.id);
//         if (!inactiveUsers.length) {
//             return res.status(200).json({ success: true, message: "No inactive users found in this range.", });
//         }

//         // 5️⃣ Send notifications to inactive users
//         const results = [];
//         for (const user of inactiveUsers) {
//             try {
//                 const fcmResponse = await fetch(
//                     `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
//                     {
//                         method: "POST",
//                         headers: {
//                             Authorization: `Bearer ${accessToken}`,
//                             "Content-Type": "application/json",
//                         },
//                         body: JSON.stringify({
//                             message: {
//                                 token: user.fcmToken,
//                                 notification: {
//                                     title: notificationExist.title || "We Miss You!",
//                                     body: notificationExist.body || `Hey ${user.name}, it's been a while since your last order. Check out our new deals 🎉`,
//                                     icon: notificationExist.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPpAh63HncAuJOC6TxWkGLYpS0WwNXswz9MA&s",
//                                 },
//                                 data: {
//                                     userId: String(user._id),
//                                     click_action: "FLUTTER_NOTIFICATION_CLICK",
//                                 },
//                             },
//                         }),
//                     }
//                 );
//                 // console.log("hhhh>=>", fcmResponse)

//                 const fcmResult = await fcmResponse.json();
//                 results.push({ user: user.email, status: fcmResult });

//             } catch (err) {
//                 console.error(`❌ FCM error for ${user.email}:`, err.message);
//                 results.push({ user: user.email, status: "failed" });
//             }
//         }

//         // 6️⃣ Send response
//         return res.status(200).json({
//             success: true, message: `${inactiveUsers.length} user(s) notification sent successfully`, results,
//         });
//     } catch (error) {
//         console.error("bulkOrderNotification Error:", error);
//         return next(new ErrorHandler(error.message, 500));
//     }
// })


const { GoogleAuth } = require("google-auth-library");
const admin = require("firebase-admin");
const path = require("path");
const fetch = require("node-fetch"); // only if Node <18

// ✅ Correct path to your service account
const serviceAccountPath = path.join(__dirname, "../../firebase-service-account.json");

// ✅ Initialize Firebase only once
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath)),
    });
}

// 🔑 Function to get OAuth2 access token
async function getAccessToken() {
    const auth = new GoogleAuth({
        keyFile: serviceAccountPath,
        scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    return accessToken.token;
}

exports.resendNotification = catchAsyncErrors(async (req, res, next) => {
    try {
        // ✅ Use project_id from service account JSON
        const serviceAccount = require(serviceAccountPath);
        const projectId = serviceAccount?.project_id; // ✅ Correct value
        const accessToken = await getAccessToken();

        // ✅ Get notification by ID
        const notificationExist = await Notification.findById(req.params.id);

        if (!notificationExist) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        // ✅ Get all users with FCM token
        const inactiveUsers = await User.find({
            fcmToken: { $exists: true, $ne: null },
        }).select("name email phone fcmToken");

        if (!inactiveUsers.length) {
            return res.status(200).json({ success: true, message: "No inactive users found." });
        }

        // ✅ Send notifications in parallel (faster)
        const results = await Promise.allSettled(
            inactiveUsers.map(async (user) => {
                const response = await fetch(
                    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            message: {
                                token: user.fcmToken,
                                notification: {
                                    title: notificationExist.title || "We Miss You!",
                                    body:
                                        notificationExist.body ||
                                        `Hey ${user.name}, it's been a while since your last order. Check out our new deals 🎉`,
                                    image:
                                        notificationExist.image ||
                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPpAh63HncAuJOC6TxWkGLYpS0WwNXswz9MA&s",
                                },
                                data: {
                                    userId: String(user._id),
                                    click_action: "FLUTTER_NOTIFICATION_CLICK",
                                },
                            },
                        }),
                    }
                );

                console.log("XXXXXXXX:==>A", response)
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`FCM Error (${response.status}): ${errorText}`);
                }

                return { user: user.email, status: await response.json() };
            })
        );

        // ✅ Format results
        const formattedResults = results.map((r, i) =>
            r.status === "fulfilled"
                ? r.value
                : { user: inactiveUsers[i].email, status: "failed", error: r.reason.message }
        );

        return res.status(200).json({
            success: true,
            message: `${inactiveUsers.length} user(s) notification processed`,
            results: formattedResults,
        });
    } catch (error) {
        console.error("resendNotification Error:", error);
        return next(new ErrorHandler(error.message, 500));
    }
});
