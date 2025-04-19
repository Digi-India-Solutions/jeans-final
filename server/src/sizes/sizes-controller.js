const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const Size = require("./sizes-model");
const fs = require('fs');
const path = require("path");
const ShortUniqueId = require("short-unique-id");

exports.createSize = catchAsyncErrors(async (req, res, next) => {
    try {
        const { size, status } = req.body;

        if (!size) {
            return next(new ErrorHandler("Size is required", 400));
        }

        // Check if size already exists
        const existingSize = await Size.find({ size });

        if (existingSize.length > 0) {
            return res.status(200).json({ success: false, message: "Size already exists" });
        }

        // const uid = new ShortUniqueId({ length: 4, dictionary: "number" });
        // const currentUniqueId = uid.rnd();
        // const uniqueSizeId = `SI${currentUniqueId}`;

        const newSize = await Size.create({ size: size, status: status });
        console.log("existingSizeX:----- : ", newSize);

        res.status(201).json({ success: true, message: "Size created successfully", data: newSize, });
    } catch (error) {
        console.error("Create Size Error:", error);
        return next(new ErrorHandler(error.message, 500));
    }
});


exports.getAllSizes = catchAsyncErrors(async (req, res, next) => {
    try {
        const { pageNumber } = req.query;
        const totalSizes = await Size.countDocuments();

        const sizes = await Size.find({}).sort({ createdAt: -1 }).skip((pageNumber - 1) * 15).limit(15)

        res.status(200).json({ success: true, data: sizes, totalSizes, totalPages: Math.ceil(totalSizes / 15), currentPage: parseInt(pageNumber, 10) });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.changeStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        const { sizeId, status } = req.body;
        console.log("sizeId", sizeId);
        const sizes = await Size.findByIdAndUpdate(sizeId, { status }).sort({ createdAt: -1 })
        res.status(200).json({ massage: "Size Status Updated Successfully", success: true, data: sizes });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getSizeByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const sizeID = req.params.id;
        const sizes = await Size.findOne({ _id: sizeID })

        sendResponse(res, 200, "Size Fetched Successfully", sizes);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.updateSizeByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const sizeID = req.params.id;
        const { size, status } = req.body;
        const sizes = await Size.findByIdAndUpdate(sizeID, { size, status }).sort({ createdAt: -1 })
        res.status(200).json({ massage: "Size Updated Successfully", success: true, data: sizes });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.deleteSizeByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const sizeID = req.params.id;
        const sizes = await Size.findByIdAndDelete(sizeID)
        res.status(200).json({ massage: "Size Deleted Successfully", success: true, data: sizes });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})  

exports.getSizes= catchAsyncErrors(async (req, res, next) => {
    try {
        const sizes = await Size.find({}).sort({ createdAt: -1 })
        res.status(200).json({ massage: "Sizes Fetched Successfully", success: true, data: sizes });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})