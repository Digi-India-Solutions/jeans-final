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
        const { mainCategoryName, status, description, slug } = req.body;

        // Validation
        if (!mainCategoryName || !status) {
            return next(new ErrorHandler("MainCategory name and status are required", 400));
        }

        // Check if already exists
        const existingCategory = await MainCategory.findOne({ mainCategoryName: mainCategoryName.trim() });
        if (existingCategory) {
            return next(new ErrorHandler("MainCategory with this name already exists", 409));
        }

        let imageUrl = "";
        if (req.file) {
            try {
                // Upload image to Cloudinary
                imageUrl = await uploadImage(req.file.path);

                // Delete local temp file after upload
                deleteLocalFile(req.file.path);
            } catch (err) {
                return next(new ErrorHandler("Image upload failed, please try again", 500));
            }
        }
        console.log("imageUrl=>", imageUrl)
        // Create new category
        const newCategory = await MainCategory.create({
            mainCategoryName: mainCategoryName.trim(),
            description: description?.trim() || "",
            slug: slug?.trim() || "",
            status,
            images: imageUrl || null,
        });

        res.status(201).json({
            success: true,
            message: "MainCategory created successfully",
            data: newCategory,
        });
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

        res.status(200).json({ success: true, data: mainCategory });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.updateMainCategoryByID = catchAsyncErrors(async (req, res, next) => {
    const mainCategoryID = req.params.id;
    const { mainCategoryName, description, slug, status } = req.body;

    // 1. Check if category exists
    const existingMainCategory = await MainCategory.findById(mainCategoryID);
    if (!existingMainCategory) {
        return next(new ErrorHandler("MainCategory not found!", 404));
    }

    let updatedImageUrl = existingMainCategory.images; // Default to old image

    // 2. If new file is uploaded
    if (req.file) {
        try {
            // Delete previous image from Cloudinary (if exists)
            if (existingMainCategory.images) {
                await deleteImage(existingMainCategory.images);
            }

            // Upload new image to Cloudinary
            updatedImageUrl = await uploadImage(req.file.path);

            // Delete local uploaded file
            deleteLocalFile(req.file.path);
        } catch (error) {
            return next(new ErrorHandler("Image upload failed: " + error.message, 500));
        }
    }
    console.log("HHHH:==>", updatedImageUrl)
    // 3. Update DB
    const updatedMainCategory = await MainCategory.findByIdAndUpdate(
        mainCategoryID,
        {
            mainCategoryName,
            description,
            status,
            slug,
            images: updatedImageUrl,
        },
        { new: true, runValidators: true }
    );

    // 4. Send response
    res.status(200).json({ success: true, message: "MainCategory updated successfully", data: updatedMainCategory, });
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

