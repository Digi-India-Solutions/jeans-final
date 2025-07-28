const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder");
const { uploadImage, deleteImage } = require("../../middleware/Uploads");
const ErrorHandler = require("../../utils/ErrorHandler");
const MainCategory = require("./mainCategorys-model");
const fs = require('fs');
const path = require("path");
const ShortUniqueId = require("short-unique-id");

exports.createMainCategory = catchAsyncErrors(async (req, res, next) => {
    try {
        const { mainCategoryName, description, status } = req.body;

        // let imageUrl = "";
        // if (req.file) {
        //     // Upload image to Cloudinary
        //     imageUrl = await uploadImage(req.file.path);

        //     // Delete local image file
        //     deleteLocalFile(req.file.path);
        // }

        // Create new category
        const newCategory = await MainCategory.create({ mainCategoryName, status, });

        res.status(200).json({ success: true, message: "MainCategory created successfully", data: newCategory, });
    } catch (error) {
        console.error("Error creating MainCategory:", error);
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getAllMainCategorys = catchAsyncErrors(async (req, res, next) => {
    try {
        const { pageNumber } = req.query;
        const totalMainCategorys = await MainCategory.countDocuments();

        const mainCategorys = await MainCategory.find({}).sort({ createdAt: -1 })

        res.status(200).json({ success: true, data: mainCategorys, totalMainCategorys, });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.changeStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        const { mainCategoryId, status } = req.body;
        const mainCategory = await MainCategory.findByIdAndUpdate(mainCategoryId, { status }).sort({ createdAt: -1 })
        res.status(200).json({ massage: "MainCategory Status Updated Successfully", success: true, data: mainCategory });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getMainCategoryByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const MainCategoryID = req.params.id;
        const mainCategory = await MainCategory.findOne({ _id: MainCategoryID })
        // .populate("productId");

        res.status(200).json({ success: true, data:mainCategory });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.updateMainCategoryByID = catchAsyncErrors(async (req, res, next) => {
    const mainCategoryID = req.params.id;
    const { mainCategoryName, description, status, oldImage } = req.body;

    const existingMainCategory = await MainCategory.findById(mainCategoryID);
    if (!existingMainCategory) {
        return next(new ErrorHandler("MainCategory not found!", 404));
    }

    // let updatedImageUrl = oldImage;

    // if (req.file) {
    //     // Delete previous image from Cloudinary if exists
    //     if (existingMainCategory?.images) {
    //         await deleteImage(existingMainCategory?.images);
    //     }

    //     // Upload new image to Cloudinary
    //     updatedImageUrl = await uploadImage(req.file.path);

    //     // Delete local image file
    //     deleteLocalFile(req.file.path);
    // }

    const updatedMainCategory = await MainCategory.findByIdAndUpdate(
        mainCategoryID,
        { mainCategoryName,  status, },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: "MainCategory updated successfully",
        data: updatedMainCategory,
    });
});

exports.deleteMainCategoryByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const mainCategoryID = req.params.id;

        const mainCategoryData = await MainCategory.findById(mainCategoryID);
        if (!mainCategoryData) {
            return next(new ErrorHandler("mainCategory not found", 404));
        }

        if (mainCategoryData?.images) {
            deleteImage(mainCategoryData.images)
        }

        await MainCategory.deleteOne({ _id: mainCategoryID });

        res.status(200).json({
            success: true,
            message: "MainCategory deleted successfully",
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

