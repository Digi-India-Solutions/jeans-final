const cloudnary = require("cloudinary").v2

cloudnary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECKRET
})

// ✅ Single image upload with optimization
const uploadImage = async (file) => {
    console.log('fileURL----------', file)
    try {
        // Step 1 — upload original
        const uploaded = await cloudnary.uploader.upload(file)

        // Step 2 — build optimized URL from public_id
        const optimizedUrl = cloudnary.url(uploaded.public_id, {
            secure: true,
            quality: "auto:best",
            fetch_format: "auto",
            version: uploaded.version,
        })

        console.log('optimizedUrl----------', optimizedUrl)
        return optimizedUrl  // ✅ returns URL with f_auto,q_auto:best
    } catch (error) {
        console.error("Cloudinary image upload failed:", error)
        throw new Error("Failed to upload image to Cloudinary")
    }
}

// ✅ Multiple images upload with optimization (for Flutter)
const uploadMultipleImages = async (files) => {
    try {
        const uploadPromises = files.map((file) =>
            cloudnary.uploader.upload(file, {
                transformation: [
                    { quality: "auto:best" },
                    { fetch_format: "auto" },
                ]
            })
        )
        const results = await Promise.all(uploadPromises)
        return results.map((result) => result.secure_url) // array of optimized URLs ✅
    } catch (error) {
        console.error("Cloudinary multiple upload failed:", error)
        throw new Error("Failed to upload images to Cloudinary")
    }
}

// ✅ PDF upload — no changes needed, working fine
const uploadsPdf = async (file) => {
    try {
        const uploadResponse = await cloudnary.uploader.upload(file, {
            folder: "catalogues",
            resource_type: "raw",
            format: "pdf",
        })
        return uploadResponse
    } catch (error) {
        console.error("Cloudinary upload error:", error)
        throw new Error("Failed to upload file to Cloudinary")
    }
}

// ✅ Fixed public ID extraction (handles folders + extensions correctly)
const deleteImage = async (imageUrls) => {
    try {
        const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls]
        for (const url of urls) {
            if (typeof url === "string") {
                // extract public_id correctly from full Cloudinary URL
                // e.g. https://res.cloudinary.com/cloud/image/upload/v123/folder/filename.jpg
                //       → public_id = "folder/filename"
                const splitUrl = url.split("/")
                const versionIndex = splitUrl.findIndex((part) => part.startsWith("v") && !isNaN(part.slice(1)))
                const publicId = splitUrl
                    .slice(versionIndex + 1)       // everything after version
                    .join("/")
                    .replace(/\.[^/.]+$/, "")      // remove extension
                await cloudnary.uploader.destroy(publicId)
                console.log(`Image deleted successfully: ${publicId}`)
            }
        }
    } catch (error) {
        console.error("Failed to delete image(s) from Cloudinary:", error)
    }
}

module.exports = {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    uploadsPdf
}
