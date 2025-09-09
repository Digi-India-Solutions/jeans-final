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
        const { name, mainCategoryId, description, status,slug } = req.body;
        let bannerUrl = "";
        let imageUrl = "";
        // if (req.file.images) {
        //     // Upload image to Cloudinary
        //     imageUrl = await uploadImage(req.file.path);

        //     // Delete local image file
        //     deleteLocalFile(req.file.path);
        // }
        // if (req.file.banner) {
        //     // Upload image to Cloudinary
        //     imageUrl = await uploadImage(req.file.path);

        //     // Delete local image file
        //     deleteLocalFile(req.file.path);
        // }

        if (req.files?.image?.[0]) {
            const localImagePath = req.files.image[0].path;
            imageUrl = await uploadImage(localImagePath);
            deleteLocalFile(localImagePath);
        }

        if (req.files?.banner?.[0]) {
            const localBannerPath = req.files.banner[0].path;
            bannerUrl = await uploadImage(localBannerPath);
            deleteLocalFile(localBannerPath);
        }

        // Create new category
        const newCategory = await Category.create({ name, description, mainCategoryId: mainCategoryId, images: imageUrl, categoryBanner: bannerUrl, status,slug });

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

        const categorys = await Category.find({}).sort({ createdAt: -1 }).populate("mainCategoryId");

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
        const category = await Category.findOne({ _id: categoryID }).populate("mainCategoryId")
        // .populate("productId");

        res.status(200).json({ success: true, data: category });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.updateCategoryByID = catchAsyncErrors(async (req, res, next) => {
    const categoryID = req.params.id;
    const { name, description, mainCategoryId, status, oldImage, oldBanner ,slug} = req.body;

    const existingCategory = await Category.findById(categoryID);
    if (!existingCategory) {
        return next(new ErrorHandler("Category not found!", 404));
    }

    let updatedImageUrl = oldImage || existingCategory.images;
    let updatedBannerUrl = oldBanner || existingCategory.categoryBanner;

    // Upload new image if provided
    if (req.files?.image?.[0]) {
        const localImagePath = req.files.image[0].path;

        // Delete old Cloudinary image
        if (existingCategory.images) {
            await deleteImage(existingCategory.images);
        }

        // Upload new image to Cloudinary
        updatedImageUrl = await uploadImage(localImagePath);

        // Remove local image file
        deleteLocalFile(localImagePath);
    }

    // Upload new banner if provided
    if (req.files?.banner?.[0]) {
        const localBannerPath = req.files.banner[0].path;

        // Delete old Cloudinary banner
        if (existingCategory.categoryBanner) {
            await deleteImage(existingCategory.categoryBanner);
        }

        // Upload new banner to Cloudinary
        updatedBannerUrl = await uploadImage(localBannerPath);

        // Remove local banner file
        deleteLocalFile(localBannerPath);
    }

    // Update category in DB
    const updatedCategory = await Category.findByIdAndUpdate(
        categoryID,
        {
            name,
            description,
            status,
            slug,
            mainCategoryId: mainCategoryId,
            images: updatedImageUrl,
            categoryBanner: updatedBannerUrl,
        },
        { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Category updated successfully", data: updatedCategory, });
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
        if (categoryData?.categoryBanner) {
            deleteImage(categoryData?.categoryBanner)
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

exports.getCategoryByMainCategoryID = catchAsyncErrors(async (req, res, next) => {
    try {
        const categoryID = req.params.id;
        const category = await Category.find({ mainCategoryId: categoryID }).populate("mainCategoryId")
        // .populate("productId");

        res.status(200).json({ success: true, data: category });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

