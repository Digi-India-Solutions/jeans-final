const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const ErrorHandler = require("../../utils/ErrorHandler");
const Enquiry = require("./enquiry-model");
const User = require("../users/users-model");
// Create
exports.createEnquiry = catchAsyncErrors(async (req, res, next) => {
    try {
        const { userId, name, phone, email, p_location, message } = req.body;
        const userExists = await User.find({ _id: userId });
        if (!userExists) {
            return res.status(201).json({ status: false, message: "User not found" });
        }
        if (!name || !phone || !email || !p_location || !message) {
            return next(new ErrorHandler("All fields are required", 400));
        }

        const newEnquiry = await Enquiry.create({ userId, name, phone, email, p_location, message });
        res.status(201).json({ status: true, message: "Enquiry submitted successfully", data: newEnquiry });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }

});

// Get All with Pagination
exports.getAllEnquiries = catchAsyncErrors(async (req, res, next) => {
    try {
        const { pageNumber = 1 } = req.query;
        const pageSize = 10;
        const total = await Enquiry.countDocuments();

        const enquiries = await Enquiry.find({}).populate("userId").sort({ createdAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize);
//  console.log("DDDDDDDD:==>", enquiries);
        res.status(200).json({ status: true, data: enquiries, total, totalPages: Math.ceil(total / pageSize), currentPage: parseInt(pageNumber), });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }

});

// Change Status
// exports.changeStatus = catchAsyncErrors(async (req, res, next) => {
//     const { id, status } = req.body;

//     const enquiry = await Enquiry.findByIdAndUpdate(id, { status }, { new: true });
//     if (!enquiry) return next(new ErrorHandler("Enquiry not found", 404));

//     res.status(200).json({ success: true, message: "Status updated", data: enquiry });
// });

// Get by ID
// exports.getEnquiryByID = catchAsyncErrors(async (req, res, next) => {
//     const enquiry = await Enquiry.findById(req.params.id);
//     if (!enquiry) return next(new ErrorHandler("Enquiry not found", 404));

//     res.status(200).json({ success: true, data: enquiry });
// });

// Update by ID
// exports.updateEnquiryByID = catchAsyncErrors(async (req, res, next) => {
//     const { name, phone, email, p_location, message, status } = req.body;

//     const enquiry = await Enquiry.findByIdAndUpdate(
//         req.params.id,
//         { name, phone, email, p_location, message, status },
//         { new: true }
//     );

//     if (!enquiry) return next(new ErrorHandler("Enquiry not found", 404));

//     res.status(200).json({ success: true, message: "Enquiry updated", data: enquiry });
// });

// Delete by ID
exports.deleteEnquiryByID = catchAsyncErrors(async (req, res, next) => {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return next(new ErrorHandler("Enquiry not found", 404));

    res.status(200).json({ success: true, message: "Enquiry deleted", data: enquiry });
});

// Get all without pagination
exports.getEnquiryList = catchAsyncErrors(async (req, res, next) => {
    const enquiries = await Enquiry.find({}).populate("userId").sort({ createdAt: -1 });
    res.status(200).json({ status: true, message: "Enquiries fetched", data: enquiries });
});
