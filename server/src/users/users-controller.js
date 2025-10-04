const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const ShortUniqueId = require("short-unique-id");
const User = require("./users-model");
const Otp = require("../otp/otp-model");
const sendToken = require("../../utils/jwtToken");
const { sendOtpForUserSignup, sendResetPassword, sendEmailByUserForRequastActiveAccount, sendEmailByAdminForRequastActiveAccount, sendEmailActiveUserAccount, sendOrderNotification } = require("../../utils/mail");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { uploadImage } = require("../../middleware/Uploads");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder");
const { Order } = require("../orders/orders-model");
const { AdminOrder } = require("../orders/orders-model");
const dayjs = require("dayjs");
const { sendOrderNotificationByAdminOnWhatsapp, sendWhatsAppByUserForRequastActiveAccount, sendWhatsAppByUserForRequastDeactiveAccount, sendWhatsAppByAdminForRequastActiveAccount } = require("../../utils/whatsAppCampaigns");

exports.sendOtpToUserSignup = catchAsyncErrors(async (req, res, next) => {
    try {
        const { email } = req.body;

        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(200).json({ status: false, message: "Email Already exists" });
        }

        const uniqueNumId = new ShortUniqueId({ length: 6, dictionary: "number" });
        const currentUniqueId = uniqueNumId.rnd();

        await Otp.create({ email: email, otp: currentUniqueId, otpExpiry: new Date(Date.now() + 20 * 60 * 1000), });

        await sendOtpForUserSignup({ email, otp: currentUniqueId });

        res.status(200).json({ success: true, message: 'OTP Sent Successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
    }
})

exports.verifyOtpToUserSignup = catchAsyncErrors(async (req, res, next) => {
    try {
        // console.log("DDDDDDD", req.body)
        const { fullName, mobile, email, otp, password, fcmToken, address } = req.body;

        if (!email || !otp || !password) {
            return res.status(200).json({ status: false, message: "All fields are required" });
        }

        const otpMatch = await Otp.findOne({ email: email, otp: otp });

        if (!otpMatch) {
            return res.status(200).json({ status: false, message: "Invalid OTP" });
        }

        if (otpMatch.otpExpiry < Date.now()) {
            await Otp.deleteMany({ email: email });  // Clean up expired OTPs
            return res.status(400).json({ status: false, message: "OTP Expired" });
        }

        await Otp.deleteMany({ email: email });

        const uniqueNumId = new ShortUniqueId({ length: 6, dictionary: "number" });
        const currentUniqueId = uniqueNumId.rnd();
        let uniqueUserId = `U${currentUniqueId}`;

        const hash = await bcrypt.hash(password, 10);

        const newUser = await User.create({ name: fullName, email, phone: mobile, password: hash, uniqueUserId, fcmToken, address });
        sendEmailByUserForRequastActiveAccount({ email, fullName, mobile });
        sendEmailByAdminForRequastActiveAccount({ email, fullName, mobile });
        sendWhatsAppByUserForRequastActiveAccount({ name: fullName, phone: mobile, });
        sendWhatsAppByAdminForRequastActiveAccount({ email, name: fullName, phone: mobile, });

        const UserPoint = await UserSignupPoint.find();
        if (UserPoint.length > 0) {
            const point = UserPoint[0].points;
            /////////////ADD POINTS//////////////////////////////
            let userPoints = await RewardPoints.findOne({ userId: newUser?._id });
            const earnedPoints = point;
            if (!userPoints) {
                userPoints = new RewardPoints({
                    userId: newUser?._id,
                    points: earnedPoints,
                    history: [{ type: "earned", amount: earnedPoints, description: `Points earned for Fist Time Signup`, }],
                });
            } else {
                userPoints.points += earnedPoints;
                userPoints.history.push({ type: "earned", amount: earnedPoints, description: `Points earned for Fist Time Signup`, });
            }
            await userPoints.save();
            //////////////////////////////////////////////////////////////////////////////////////////////
        }

        sendToken(newUser, 200, res, "User Created Successfully");

    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
})

exports.userLogin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(200).json({ status: false, message: "User Not Found" });
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);

        if (!isPasswordMatched) {
            return res.status(200).json({ status: false, message: "Incorrect Password" });
        }

        // Create a JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_EXPIRES }
        );

        res.status(200).json({ status: true, message: "User Logged In Successfully", token, user });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
})

exports.sendResetPasswordEmail = catchAsyncErrors(async (req, res, next) => {
    try {
        const { email } = req.body;
        console.log("Email:", email);
        if (!email) {
            return res.status(401).json({ status: false, message: "Email is required" });
        }
        console.log("Email:", email);

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ status: false, message: "User not found" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_EXPIRES }
        );

        const mailData = {
            email: email,
            token: token,
            user: user,
        };

        await sendResetPassword(mailData);
        res.status(200).json({ status: true, token: token, email: email, message: "Reset password email sent successfully" });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
})

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    try {
        // Destructure the token and new_password from the request body
        const { token, new_password } = req.body;
        console.log("TOKEN:", token, new_password);  // Logging token and password for debugging

        if (!token) {
            return res.status(400).json({ status: false, message: "No token found" });
        }

        // Check if the secret is loaded correctly
        if (!process.env.JWT_SECRET_KEY) {
            return res.status(500).json({ status: false, message: "JWT secret is not defined in the environment" });
        }

        // Decode and verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            return res.status(400).json({ status: false, message: "Token is not valid" });
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(400).json({ status: false, message: "User not found" });
        }

        // Hash the new password and save it
        const hashedPassword = await bcrypt.hash(new_password, 10);
        user.password = hashedPassword;

        // Save the updated password
        await user.save();
        return res.status(200).json({ status: true, message: "User password changed successfully" });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ status: false, message: "Internal server error", error: error.message });
    }
})

exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getUserById = catchAsyncErrors(async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).sort({ createdAt: -1 });

        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        await user.deleteOne();

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
    }
})

exports.updateUserWithPhoto = catchAsyncErrors(async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { name, email, street, city, state, zipCode, country, phone, shopname, fcmToken } = req.body;

        // Check if user exists first
        const exist = await User.findById(userId);
        if (!exist) {
            return next(new ErrorHandler("User Not Found", 404));
        }

        let imageUrl = exist.photo || "";

        // Handle new photo upload if provided
        if (req.file?.path) {
            imageUrl = await uploadImage(req.file.path);
            deleteLocalFile(req.file.path);
        }

        // Prepare updated data
        const updateData = {
            name, email, phone, shopname, photo: imageUrl, address: { street, city, state, zipCode, country, }, fcmToken
        };

        // Update and return new document
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });

        if (!updatedUser) {
            return next(new ErrorHandler("User Update Failed", 400));
        }

        res.status(200).json({ success: true, message: "User Updated Successfully!", user: updatedUser, });

    } catch (error) {
        return next(new ErrorHandler(error.message || "Internal Server Error", 500));
    }
});

exports.changePassword = catchAsyncErrors(async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return next(new ErrorHandler("Current and new passwords are required", 400));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User not found!", 404));
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return sendResponse(res, 401, "Incorrect current password");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        sendResponse(res, 200, "Password changed successfully");
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { name, email, street, city, state, zipCode, country, phone, shopname, fcmToken } = req.body


        const updatedUser = await User.findByIdAndUpdate(userId, { name, email, phone, shopname, address: { street, city, state, zipCode, country, }, fcmToken });

        if (!updatedUser) {
            return next(new ErrorHandler("User Not Found", 404));
        }

        sendResponse(res, 200, "User Updated Successfully", updatedUser);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.searchUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const { term } = req.params;
        const pageNumber = req.query.pageNumber || 1;

        const query = {
            $or: [
                { name: { $regex: new RegExp(term, "i") } },
                { email: { $regex: new RegExp(term, "i") } },
                { phone: { $regex: new RegExp(term, "i") } },
                { 'address.street': { $regex: new RegExp(term, "i") } },
                { 'address.city': { $regex: new RegExp(term, "i") } },
                { 'address.state': { $regex: new RegExp(term, "i") } },
                { 'address.zipCode': { $regex: new RegExp(term, "i") } },
                { 'address.country': { $regex: new RegExp(term, "i") } },
                { uniqueUserId: { $regex: new RegExp(term, "i") } },
            ],
        }

        const total = await User.countDocuments(query);

        const users = await User.find(query)
            .sort({ created_at: -1 })
            .skip((pageNumber - 1) * 15)
            .limit(15);

        sendResponse(res, 200, "users fetched successfully", {
            users,
            total,
            totalPages: Math.ceil(total / 15)
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }

})

exports.sendMessageWhatsapp = catchAsyncErrors(async (req, res, next) => {
    try {
        const { message, phone } = req.body;
        console.log("URL:-", message, phone);
        // await sendWhatsAppMessage(message);
        const phones = phone; // user phone
        const messages = encodeURIComponent(`${message}✅ You have successfully logged in to Bizzify!`);
        const url = `https://wa.me/${phones}?text=${messages}`;

        // Redirect user to WhatsApp
        console.log("URL:-", url);
        res.status(200).json({ success: true, whatsappLink: url });

        // sendResponse(res, 200, "Message sent successfully");
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.toggleStatusUserId = catchAsyncErrors(async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        user.isActive = !user.isActive;
        await user.save();
        // console.log("hhhhhhh", user.email);
        const email = user.email
        const fullName = user.name
        const isActive = user.isActive
        sendEmailActiveUserAccount({ email, fullName, isActive });
        sendWhatsAppByUserForRequastDeactiveAccount({ name: fullName, phone: user.phone, isActive });
        res.json({ success: true, message: "Status updated successfully" });
    } catch (err) {
        console.log("ERROR:-", err);
        res.json({ success: false, message: "Failed to update status" });
    }
})


exports.bulkOrderNotification = catchAsyncErrors(async (req, res, next) => {
    try {
        const { minDays = 60, maxDays = 80 } = req.body;

        // Calculate date range
        const fromDate = dayjs().subtract(maxDays, "day").toDate();
        const toDate = dayjs().subtract(minDays, "day").toDate();

        // Find users who placed orders in the range
        const recentOrderUsers = await Order.distinct("userId", {
            createdAt: { $gte: fromDate, $lte: toDate }
        });

        // Find users who DID NOT place any order in last X days
        const allUsers = await User.find({ isActive: true });
        const inactiveUsers = allUsers.filter(
            (user) => !recentOrderUsers.includes(user._id.toString())
        );

        // Send notification logic (you can replace this with email/SMS/etc)
        for (const user of inactiveUsers) {
            console.log("user", user);
            await sendOrderNotification({ email: user.email, name: user.name, mobile: user.phone });
            await sendOrderNotificationByAdminOnWhatsapp({ email: user.email, name: user.name, mobile: user.phone });
        }

        return res.status(200).json({
            success: true,
            message: `${inactiveUsers.length} user(s) notified who haven't ordered in last ${minDays}-${maxDays} days.`,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// exports.getUsersWithoutOrders = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const days = parseInt(req.params.days);

//         const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

//         const orders = await Order.find({ createdAt: { $gte: sinceDate } })
//         const Users = await User.find();
//         const userIdsWithOrders = Users?.map(user => orders?.filter(order => order?.userId?.toString() === user?._id?.toString()));
//         console.log("userIdsWithOrders:=>", userIdsWithOrders.length);
//         return res.json({ status: true, data: userIdsWithOrders });

//     } catch (error) {
//         console.error("Error in getUsersWithoutOrders:", error);
//         return res.status(500).json({ status: false, message: "Server Error" });
//     }
// });

exports.getUsersWithoutOrders = catchAsyncErrors(async (req, res, next) => {
    try {
        const days = parseInt(req.params?.days);
        console.log("days:=>", days);
        if (isNaN(days) || days <= 0) {
            return res.status(400).json({ status: false, message: "Invalid number of days" });
        }

        const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const recentOrders = await AdminOrder.find({ createdAt: { $gte: sinceDate } }).select("customer.userId");

        const orderedUserIds = new Set(recentOrders.map(order => order?.customer?.userId));

        const usersWithoutOrders = await User.find({ _id: { $nin: Array.from(orderedUserIds) } });
        console.log("XXXXXX:==>", usersWithoutOrders);
        const formattedUsers = usersWithoutOrders.map(user => ({ _id: user._id, name: user.name, email: user.email, phone: user.phone, isActive: user.isActive, createdAt: user?.createdAt, address: user?.address, fcmToken: user?.fcmToken, shopname: user?.shopname, photo: user?.photo, uniqueUserId: user?.uniqueUserId, isUser: user?.isUser }));
        const RevercFormattedUsers = formattedUsers.reverse();
        return res.status(200).json({ status: true, data: RevercFormattedUsers, orderData: orderedUserIds });

    } catch (error) {
        console.error("Error in getUsersWithoutOrders:", error);
        return res.status(500).json({ status: false, message: "Server Error" });
    }
});

const { GoogleAuth } = require("google-auth-library");
const admin = require("firebase-admin");
const path = require("path");
const { UserSignupPoint, RewardPoints } = require("../rewordsPoints/rewordsPoints-model");

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
        keyFile: serviceAccountPath, // service account JSON file
        scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    return accessToken.token;
}

exports.bulkNotification = catchAsyncErrors(async (req, res, next) => {
    try {
        const { minDays = 60, maxDays = 80 } = req.body;
        const projectId = "anibhavicreation-95213"; // Firebase Project ID

        // 1️⃣ Get OAuth2 token
        const accessToken = await getAccessToken();

        // 2️⃣ Calculate date range
        // const fromDate = dayjs().subtract(maxDays, "day").toDate();
        // const toDate = dayjs().subtract(minDays, "day").toDate();

        // 3️⃣ Find users who placed orders within the date range
        // const recentOrderUsers = await Order.distinct("userId", {
        //     createdAt: { $gte: fromDate, $lte: toDate },
        // });

        // 4️⃣ Find active users who did NOT order recently
        // const inactiveUsers = await User.find({
        //     isActive: true,
        //     _id: { $nin: recentOrderUsers },
        //     fcmToken: { $exists: true, $ne: null }, // must have FCM token
        // }).select("name email phone fcmToken");

        // if (!inactiveUsers.length) {
        //     return res.status(200).json({
        //         success: true,
        //         message: "No inactive users found in this range.",
        //     });
        // }

        // 5️⃣ Send notifications to inactive users
        const inactiveUsers = await User.find({ isActive: true, fcmToken: { $exists: true, $ne: null } }).select("name email phone fcmToken");

        const results = [];

        for (const user of inactiveUsers) {
            try {
                await sendOrderNotification({ email: user.email, name: user.name, mobile: user.phone });
                await sendOrderNotificationByAdminOnWhatsapp({ email: user.email, name: user.name, mobile: user.phone });

                const fcmResponse = await fetch(
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
                                    title: "We Miss You!",
                                    body: `Hey ${user.name}, it's been a while since your last order. Check out our new deals 🎉`,
                                    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPpAh63HncAuJOC6TxWkGLYpS0WwNXswz9MA&s",
                                },
                                data: {
                                    userId: String(user._id),
                                    click_action: "FLUTTER_NOTIFICATION_CLICK",
                                },
                            },
                        }),
                    }
                );
                console.log("hhhh>=>", fcmResponse)

                const fcmResult = await fcmResponse.json();
                results.push({ user: user.email, status: fcmResult });

            } catch (err) {
                console.error(`❌ FCM error for ${user.email}:`, err.message);
                results.push({ user: user.email, status: "failed" });
            }
        }

        // 6️⃣ Send response
        return res.status(200).json({ success: true, message: `${inactiveUsers.length} user(s) notified who haven't ordered in last ${minDays}-${maxDays} days.`, results, });
    } catch (error) {
        console.error("bulkOrderNotification Error:", error);
        return next(new ErrorHandler(error.message, 500));
    }
});
