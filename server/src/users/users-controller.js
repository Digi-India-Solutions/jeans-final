const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const ShortUniqueId = require("short-unique-id");
const User = require("./users-model");
const Otp = require("../otp/otp-model");
const sendToken = require("../../utils/jwtToken");
const { sendOtpForUserSignup, sendResetPassword } = require("../../utils/mail");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { uploadImage } = require("../../middleware/Uploads");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder");

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
        console.log("DDDDDDD", req.body)
        const { fullName, mobile, email, otp, password } = req.body;

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

        const newUser = await User.create({ name: fullName, email, phone: mobile, password: hash, uniqueUserId, });

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
        res.status(200).json({ status: true, message: "Reset password email sent successfully" });

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
        const users = await User.find();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getUserById = catchAsyncErrors(async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

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
        const { name, email, street, city, state, zipCode, country, phone } = req.body

        let imageUrl = "";
        if (req.file) {
            imageUrl = await uploadImage(req.file.path);

            deleteLocalFile(req.file.path);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { name, email, phone, photo: imageUrl, address: { street, city, state, zipCode, country, }, });

        if (!updatedUser) {
            return next(new ErrorHandler("User Not Found", 404));
        }

        sendResponse(res, 200, "User Updated Successfully", updatedUser);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

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
        const { name, email, street, city, state, zipCode, country, phone } = req.body


        const updatedUser = await User.findByIdAndUpdate(userId, { name, email, phone, address: { street, city, state, zipCode, country, }, });

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