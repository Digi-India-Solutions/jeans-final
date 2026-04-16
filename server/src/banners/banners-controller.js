const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const ErrorHandler = require("../../utils/ErrorHandler");
const Banner = require("./banners-model");
const { uploadImage, deleteImage } = require("../../middleware/Uploads");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder");

const normalizeImages = (images) => {
    if (!images) return [];
    return Array.isArray(images) ? images.filter(Boolean) : [images];
};

exports.createBanners = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log("FILE:", req.file);
console.log("BODY:", req.body);
        const { name, isActive, url } = req.body;
        console.log("Request Body:==>", req.body);

        if (!req.file) {
            return res.status(400).json({ status: false, message: "Image is required" });
        }

        const existingBanner = await Banner.findOne({ name: name });
        if (existingBanner) {
            return res.status(200).json({ status: false, message: "Banner already exists!" });
        }

        const imageUrl = await uploadImage(req.file.path);
        // imageUrls.push(imageUrl);
        // deleteLocalFile(file.path);
        deleteLocalFile(req.file.path);
        // }

        // console.log("---------", imageUrls)

        const newBanner = await Banner.create({ name, images: imageUrl, url: url, isActive: isActive === "true" || isActive === true, position: req.body.position, startDate: req.body.startDate, endDate: req.body.endDate });

        deleteLocalFile(req.file.path);
        res.status(200).json({ status: true, message: "Banner created", data: newBanner });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});



// exports.updateBanner = catchAsyncErrors(async (req, res, next) => {
//     const { name, oldImages, isActive } = req.body;
//     const { id } = req.params;

//     try {
//         let banner = await Banner.findById(id);
//         if (!banner) {
//             return res.status(404).json({ success: false, message: 'Banner not found' });
//         }

//         let updatedImageUrl = oldImages || banner.images;

//         // if (req.file) {
//         //     if (banner.images && normalizeImages(banner.images).length > 0) {
//         //         await deleteImage(banner.images);
//         //     }

//         //     updatedImageUrl = await uploadImage(req.file.path);
//         //     deleteLocalFile(req.file.path);
//         // }

//         if (req.file) {
//     if (banner.images && normalizeImages(banner.images).length > 0) {
//         await deleteImage(banner.images);
//     }

//     const result = await uploadImage(req.file.path);
//     updatedImageUrl = result.secure_url; // ✅ FIX

//     deleteLocalFile(req.file.path);
// }

//         const updatedBannerData = {
//             name: name || banner.name,
//             images: normalizeImages(updatedImageUrl),
//             url: req.body.url || banner.url,
//             position: req.body.position || banner.position,
//             startDate: req.body.startDate || banner.startDate,
//             endDate: req.body.endDate || banner.endDate,
//             isActive: isActive !== undefined ? isActive === "true" || isActive === true : banner.isActive,
//         };

//         const updatedBanner = await Banner.findByIdAndUpdate(id, updatedBannerData, { new: true });

//         res.status(200).json({ success: true, message: "Banner updated successfully", banner: updatedBanner, });
//     } catch (error) {
//         console.error("Update banner error:", error);
//         res.status(500).json({ success: false, message: "Failed to update banner", error: error.message, });
//     }
// });

exports.updateBanner = catchAsyncErrors(async (req, res, next) => {
    const { name, oldImages, isActive } = req.body;
    const { id } = req.params;

    try {
        let banner = await Banner.findById(id);
        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        let updatedImageUrl = oldImages || banner.images;

        if (req.file) {
            if (banner.images && normalizeImages(banner.images).length > 0) {
                await deleteImage(banner.images);
            }

            updatedImageUrl = await uploadImage(req.file.path);
            if (!updatedImageUrl) {
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }

            deleteLocalFile(req.file.path);
        }

        const updatedBannerData = {
            name: name || banner.name,
            images: normalizeImages(updatedImageUrl),
            url: req.body.url || banner.url,
            position: req.body.position || banner.position,
            startDate: req.body.startDate || banner.startDate,
            endDate: req.body.endDate || banner.endDate,
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

        if (banner.images && normalizeImages(banner.images).length > 0) {
            await deleteImage(banner.images);
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
        const banners = await Banner.find().sort({ createdAt: -1 });
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