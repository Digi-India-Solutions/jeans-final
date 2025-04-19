const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const fs = require('fs');
const Banner = require("./banners-model");
const { console } = require("inspector");
const { uploadImage, deleteImage } = require("../../middleware/Uploads");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder");

exports.createBanners = catchAsyncErrors(async (req, res, next) => {
    try {
        const { name, isActive } = req.body;
        console.log('req.body::', req.body)
        console.log('req.FILE::', req.file)
        const existingBanner = await Banner.findOne({ name: name });
        if (existingBanner) {
            return res.status(200).json({ status: false, message: "Banner already exists!" });
        }

        // if (!req.files || req.file.length === 0) {
        //     return res.status(200).json({ status: false, message: "No files uploaded" });
        // }

        // const imagePaths = req.files.map((file) => file.filename);
        const imageUrls = [];
        // for (let file of req.files) {
        const imageUrl = await uploadImage(req.file.path);
        // imageUrls.push(imageUrl);
        // deleteLocalFile(file.path);
        // deleteLocalFile(req.file.path);
        // }

        // console.log("---------", imageUrls)

        const newBanner = await Banner.create({ name, images: imageUrl, isActive: isActive === "true" || isActive === true, });

        deleteLocalFile(req.file.path);
        // return sendResponse(res, 200, "Banner Created Successfully", newBanner);
        res.status(200).json({ status: true, message: "Banner created", data: newBanner });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});



exports.updateBanner = catchAsyncErrors(async (req, res, next) => {
    const { name, oldImages, isActive } = req.body;
    const { id } = req.params;

    try {
        let banner = await Banner.findById(id);
        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        let updatedImageUrl = oldImages; // default to old image
        console.log("XXXXXX:-", req.file)
        if (req.file) {
            // Delete previous image from cloud if exists
            if (banner.images) {
                await deleteImage(banner.images); // Cloudinary
            }

            // Upload new image
            updatedImageUrl = await uploadImage(req.file.path);

            // Delete from local disk
            deleteLocalFile(req.file.path);
        }

        const updatedBannerData = {
            name: name || banner.name,
            images: updatedImageUrl,
            isActive: isActive !== undefined ? isActive === "true" || isActive === true : banner.isActive,
        };

        const updatedBanner = await Banner.findByIdAndUpdate(id, updatedBannerData, { new: true });

        res.status(200).json({ success: true, message: "Banner updated successfully", banner: updatedBanner, });
    } catch (error) {
        console.error("Update banner error:", error);
        res.status(500).json({ success: false, message: "Failed to update banner", error: error.message, });
    }
});

// Delete banner
exports.deleteBanner = catchAsyncErrors(async (req, res, next) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });

        if(banner.images){
            deleteImage(banner.images)
        }
        
        await banner.deleteOne();
        res.status(200).json({ success: true, message: "Banner deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

//   // Change status
exports.changeStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        const { bannerId, isActive } = req.body;
        const banner = await Banner.findById(bannerId);

        if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });

        banner.isActive = isActive;
        await banner.save();

        res.status(200).json({ success: true, message: "Status updated" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

//   // Get all
exports.getAllBanners = catchAsyncErrors(async (req, res, next) => {
    try {
        const banners = await Banner.find().sort({ position: 1 });
        res.status(200).json({ success: true, data: banners });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

//   // Get single
exports.getSingleBanner = catchAsyncErrors(async (req, res, next) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) return res.status(404).json({ success: false, message: "Not found" });

        res.status(200).json({ success: true, data: banner });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
