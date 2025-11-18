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
        let { pageNumber = 1, filters = "{}" } = req.query;

        // Safe parse filter
        let filterObj = {};
        try {
            filterObj = JSON.parse(filters);
        } catch (err) {
            filterObj = {};
        }

        const { type, status, priority, search } = filterObj;

        // Build MongoDB query object
        let query = {};

        if (type) query.type = type;
        if (status) query.status = status;
        if (priority) query.priority = priority;

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } },
                { message: { $regex: search, $options: "i" } }
            ];
        }

        const pageSize = 10;
        pageNumber = parseInt(pageNumber);

        const total = await Enquiry.countDocuments(query);
        const enquiries = await Enquiry?.find(query).populate("userId").sort({ createdAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize);

        res.status(200).json({
            status: true, message: "Enquiries fetched successfully",
            data: enquiries, total, totalPages: Math.ceil(total / pageSize), currentPage: pageNumber,
        });

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
exports.updateEnquiryByID = catchAsyncErrors(async (req, res, next) => {
    const { name, phone, email, p_location, message, status, response } = req.body;

    const enquiry = await Enquiry.findById(req.params.id,);

    if (!enquiry) return next(new ErrorHandler("Enquiry not found", 404));
    if (name) enquiry.name = name;
    if (phone) enquiry.phone = phone;
    if (email) enquiry.email = email;
    if (p_location) enquiry.p_location = p_location;
    if (response) enquiry.message = response;
    if (status) enquiry.enquirystatus = status || enquiry.enquirystatus;

    enquiry.save();

    res.status(200).json({ success: true, message: "Enquiry updated", data: enquiry });
});

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


exports.getEnquiriesByFilters = catchAsyncErrors(async (req, res, next) => {
    try {
        const { filters } = req.body;
        let { type, status, search } = filters;
        console.log("XXXXXX::=>XXXXXX::=>", filters);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        let query = {};

        if (type) query.type = type;
        if (status) query.status = status;

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } },
                { message: { $regex: search, $options: "i" } }
            ];
        }

        // Total count
        const total = await Enquiry.countDocuments(query);

        const enquiries = await Enquiry.find(query).populate("userId").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

        res.status(200).json({
            status: true,
            message: "Enquiries fetched",
            data: enquiries,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
