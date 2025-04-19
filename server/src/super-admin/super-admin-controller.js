const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const SuperAdmin = require("./super-admin-model");
const bcrypt = require("bcryptjs");
const sendToken = require("../../utils/jwtToken");
const ShortUniqueId = require("short-unique-id");
const { sendEmailUpdateOtp, sendResetPasswordSuperAdmin } = require("../../utils/mail");
const jwt = require("jsonwebtoken");


exports.createSuperAdmin = catchAsyncErrors(async (req, res, next) => {
    console.log('req.body::', req.body)
    try {
        const { email, password } = req.body;
        console.log('req.body::', req.body)
        const hash = await bcrypt.hash(password, 10);

        const currentSuperAdmin = await SuperAdmin.findOne({ email });

        if (currentSuperAdmin) {
            return next(new ErrorHandler("Super Admin email already exist.", 500));
        }

        const newSuperAdmin = await SuperAdmin.create({ ...req.body, password: hash });

        sendResponse(res, 200, "Super Admin created successfully", newSuperAdmin);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.superAdminLogin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const superAdmin = await SuperAdmin.findOne({ email });

        if (!superAdmin) {
            return res.status(200).json({ status: false, message: "Super Admin does not exist" })
        }
        const passwordMatch = await bcrypt.compare(password, superAdmin.password)

        if (passwordMatch) {
            sendToken(superAdmin, 200, res, "Super Admin Login successfully");
        }
        else {
            res.status(200).json({ status: false, message: "Password Incorrect" })
        }
    } catch (error) {
        res.status(500).json({ status: false, data: error.message })
    }
});

exports.sendResetPasswordEmail = catchAsyncErrors(async (req, res, next) => {
    try {

        const { email } = req.body;
        const superAdmin = await SuperAdmin.findOne({ email });

        if (!superAdmin) {
            return res.status(200).json({ status: false, message: "Admin not found" });
        }

        const token = superAdmin.getJwtToken();

        let mail_data = { email: email, token: token, user: 'admin' };

        await sendResetPasswordSuperAdmin(mail_data);
        res.status(200).json({ status: true, message: "Reset password mail sent successfully" });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    try {
        const { token, new_password } = req.body;

        if (!token) {
            next(new ErrorHandler("No token found", 400));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            next(new ErrorHandler("Token is not valid", 400));
        }

        const superAdmin = await SuperAdmin.findById(decoded.id);

        // Update the password
        const hash = await bcrypt.hash(new_password, 10);
        superAdmin.password = hash;

        await superAdmin.save();
        // sendResponse(res, 200, "super-admin password changed successfully", []);
        res.status(200).json({ status: true, message: "Password changed successfully" });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});



// exports.updateSuperAdminByID = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const superAdminID = req.params.id;

//         console.log('req.body::', req.body.bankDetails)

//         const superAdmin = await SuperAdmin.findByIdAndUpdate(superAdminID, req.body, {
//             new: true,
//             runValidators: true,
//         });

//         if (!superAdmin) {
//             return next(new ErrorHandler("Super Admin not found!", 400));
//         }

//         sendResponse(res, 200, "Super Admin Updated Successfully", superAdmin);
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// })

// exports.changePassword = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const superAdminID = req.params.id;
//         const { currentPassword, newPassword } = req.body;

//         const superAdmin = await SuperAdmin.findById(superAdminID);

//         if (!superAdmin) {
//             return next(new ErrorHandler("Super Admin not found!", 400));
//         }

//         const passwordMatch = await bcrypt.compare(currentPassword, superAdmin.password)

//         if (passwordMatch) {
//             const hash = await bcrypt.hash(newPassword, 10);
//             const superAdminUpdated = await SuperAdmin.findByIdAndUpdate(superAdminID, { password: hash }, {
//                 new: true,
//                 runValidators: true,
//             });
//             sendResponse(res, 200, "Super Admin Password Changed Successfully", superAdminUpdated);
//         }
//         else {
//             return res.status(500).json({ status: false, message: "Wrong Password" });
//         }

//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// })


// exports.sendOtpForChangeEmail = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { email, new_email } = req.body;

//         const uniqueId = new ShortUniqueId({ length: 4, dictionary: "number" });
//         const currentUniqueId = uniqueId.rnd();

//         const superAdmin = await SuperAdmin.findOne({ email });

//         if (!superAdmin) {
//             return next(new ErrorHandler("superAdmin not found", 404));
//         }

//         superAdmin.otp = currentUniqueId;
//         await superAdmin.save();

//         let mail_data = {
//             otp: currentUniqueId,
//             email: new_email,
//             name: superAdmin.name,
//         };

//         await sendEmailUpdateOtp(mail_data);

//         sendResponse(res, 200, "otp sent successfully.", []);
//     } catch (error) {
//         next(new ErrorHandler(error.message, 500));
//     }
// });


// exports.verifyOtpForChangeEmail = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { email, new_email, otp } = req.body;

//         // Find the Super Admin by email
//         const superAdmin = await SuperAdmin.findOne({ email });

//         if (!superAdmin) {
//             return next(new ErrorHandler("Super Admin not found", 404));
//         }

//         // Check if the OTP matches
//         if (superAdmin.otp !== otp) {
//             return next(new ErrorHandler("OTP didn't match, please try again", 400));
//         }

//         // Update the Super Admin to clear the OTP
//         superAdmin.email = new_email;
//         superAdmin.otp = "";
//         await superAdmin.save();

//         // Send the response with the updated sub-admin
//         sendResponse(res, 200, "Super Admin email updation successful", superAdmin);
//     } catch (error) {
//         next(new ErrorHandler(error.message, 500));
//     }
// });

// exports.sendOtpForChangePhone = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { phone, new_phone } = req.body;

//         const uniqueId = new ShortUniqueId({ length: 4, dictionary: "number" });
//         const currentUniqueId = uniqueId.rnd();

//         const superAdmin = await SuperAdmin.findOne({ phone });

//         if (!superAdmin) {
//             return next(new ErrorHandler("superAdmin not found", 404));
//         }

//         superAdmin.otp = currentUniqueId;
//         await superAdmin.save();

//         // let mail_data = {
//         //     otp: currentUniqueId,
//         //     email: new_phone,
//         //     name: superAdmin.name,
//         // };

//         // await sendEmailUpdateOtp(mail_data);

//         sendResponse(res, 200, "otp sent successfully.", { otp: currentUniqueId });
//     } catch (error) {
//         next(new ErrorHandler(error.message, 500));
//     }
// });


// exports.verifyOtpForChangePhone = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { phone, new_phone, otp } = req.body;

//         // Find the Super Admin by email
//         const superAdmin = await SuperAdmin.findOne({ phone });

//         if (!superAdmin) {
//             return next(new ErrorHandler("Super Admin not found", 404));
//         }

//         // Check if the OTP matches
//         if (superAdmin.otp !== otp) {
//             return next(new ErrorHandler("OTP didn't match, please try again", 400));
//         }

//         // Update the Super Admin to clear the OTP
//         superAdmin.phone = new_phone;
//         superAdmin.otp = "";
//         await superAdmin.save();

//         // Send the response with the updated sub-admin
//         sendResponse(res, 200, "Super Admin phone updation successful", superAdmin);
//     } catch (error) {
//         next(new ErrorHandler(error.message, 500));
//     }
// });






