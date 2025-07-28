const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder");
const { uploadImage, deleteImage } = require("../../middleware/Uploads");
const ErrorHandler = require("../../utils/ErrorHandler");
const SubCategory = require("./subCategorys-model");
const fs = require('fs');
const path = require("path");
const ShortUniqueId = require("short-unique-id");

exports.createSubCategory = catchAsyncErrors(async (req, res, next) => {
    try {
        const { subCategoryName, description, status } = req.body;

        let imageUrl = "";
        if (req.file) {
            // Upload image to Cloudinary
            imageUrl = await uploadImage(req.file.path);

            // Delete local image file
            deleteLocalFile(req.file.path);
        }

        // Create new category
        const newCategory = await SubCategory.create({ subCategoryName, description, images: imageUrl, status, });

        res.status(200).json({ success: true, message: "SubCategory created successfully", data: newCategory, });
    } catch (error) {
        console.error("Error creating SubCategory:", error);
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getAllSubCategorys = catchAsyncErrors(async (req, res, next) => {
    try {
        const { pageNumber } = req.query;
        const totalSubCategorys = await SubCategory.countDocuments();

        const subCategorys = await SubCategory.find({}).sort({ createdAt: -1 })

        res.status(200).json({ success: true, data: subCategorys, totalSubCategorys, });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.changeStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        const { SubCategoryId, status } = req.body;
        const subCategory = await SubCategory.findByIdAndUpdate(SubCategoryId, { status }).sort({ createdAt: -1 })
        res.status(200).json({ massage: "subCategory Status Updated Successfully", success: true, data: subCategory });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getSubCategoryByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const subCategoryID = req.params.id;
        const subCategory = await SubCategory.findOne({ _id: subCategoryID })
        // .populate("productId");

        res.status(200).json({ success: true, data:subCategory });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.updateSubCategoryByID = catchAsyncErrors(async (req, res, next) => {
    const subCategoryID = req.params.id;
    const { subCategoryName, description, status, oldImage } = req.body;

    const existingSubCategory = await SubCategory.findById(subCategoryID);
    if (!existingSubCategory) {
        return next(new ErrorHandler("SubCategory not found!", 404));
    }

    let updatedImageUrl = oldImage;

    if (req.file) {
        // Delete previous image from Cloudinary if exists
        if (existingSubCategory?.images) {
            await deleteImage(existingSubCategory?.images);
        }

        // Upload new image to Cloudinary
        updatedImageUrl = await uploadImage(req.file.path);

        // Delete local image file
        deleteLocalFile(req.file.path);
    }

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
        subCategoryID,
        { subCategoryName, description, status, images: updatedImageUrl, },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: "SubCategory updated successfully",
        data: updatedSubCategory,
    });
});

exports.deleteSubCategoryByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const subCategoryID = req.params.id;

        const subCategoryData = await SubCategory.findById(subCategoryID);
        if (!subCategoryData) {
            return next(new ErrorHandler("SubCategory not found", 404));
        }

        if (subCategoryData?.images) {
            deleteImage(subCategoryData.images)
        }

        await SubCategory.deleteOne({ _id: subCategoryID });

        res.status(200).json({
            success: true,
            message: "SubCategory deleted successfully",
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

