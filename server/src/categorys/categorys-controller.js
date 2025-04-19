const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder");
const { uploadImage, deleteImage } = require("../../middleware/Uploads");
const ErrorHandler = require("../../utils/ErrorHandler");
const Category = require("./categorys-model");
const fs = require('fs');
const path = require("path");
const ShortUniqueId = require("short-unique-id");

exports.createCategory = catchAsyncErrors(async (req, res, next) => {
    try {
        const { name, description, status } = req.body;

        let imageUrl = "";
        if (req.file) {
            // Upload image to Cloudinary
            imageUrl = await uploadImage(req.file.path);

            // Delete local image file
            deleteLocalFile(req.file.path);
        }

        // Create new category
        const newCategory = await Category.create({ name, description, images: imageUrl, status, });

        res.status(200).json({ success: true, message: "Category created successfully", data: newCategory, });
    } catch (error) {
        console.error("Error creating category:", error);
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getAllCategorys = catchAsyncErrors(async (req, res, next) => {
    try {
        const { pageNumber } = req.query;
        const totalCategorys = await Category.countDocuments();

        const categorys = await Category.find({}).sort({ createdAt: -1 })

        res.status(200).json({ success: true, data: categorys, totalCategorys, });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.changeStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        const { categoryId, status } = req.body;
        const category = await Category.findByIdAndUpdate(categoryId, { status }).sort({ createdAt: -1 })
        res.status(200).json({ massage: "category Status Updated Successfully", success: true, data: category });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getCategoryByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const categoryID = req.params.id;
        const category = await Category.findOne({ _id: categoryID })
        // .populate("productId");

        res.status(200).json({ success: true, data: category });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.updateCategoryByID = catchAsyncErrors(async (req, res, next) => {
    const categoryID = req.params.id;
    const { name, description, status, oldImage } = req.body;

    const existingCategory = await Category.findById(categoryID);
    if (!existingCategory) {
        return next(new ErrorHandler("Category not found!", 404));
    }

    let updatedImageUrl = oldImage;

    if (req.file) {
        // Delete previous image from Cloudinary if exists
        if (existingCategory.images) {
            await deleteImage(existingCategory.images);
        }

        // Upload new image to Cloudinary
        updatedImageUrl = await uploadImage(req.file.path);

        // Delete local image file
        deleteLocalFile(req.file.path);
    }

    const updatedCategory = await Category.findByIdAndUpdate(
        categoryID,
        { name, description, status, images: updatedImageUrl, },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: updatedCategory,
    });
});

exports.deleteCategoryByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const categoryID = req.params.id;

        const categoryData = await Category.findById(categoryID);
        if (!categoryData) {
            return next(new ErrorHandler("Category not found", 404));
        }

        if (categoryData?.images) {
            deleteImage(categoryData.images)
        }

        await Category.deleteOne({ _id: categoryID });

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

