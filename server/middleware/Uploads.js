const cloudnary = require("cloudinary").v2

cloudnary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECKRET
})


const uploadImage = async (file) => {
    // console.log('fileURL----------', file)
    try {
        const imageurl = await cloudnary.uploader.upload(file)
        // console.log('imageurl----------', imageurl)
        return imageurl.secure_url
    } catch (error) {
        console.log(error)
    }
}


// const deleteImage = async (imageUrl) => {
//     try {
//         console.log('xxxxxxxxxxxxxxxx:::', imageUrl)
//         const publicId = imageUrl.split("/").pop().split(".")[0];
//         await cloudnary.uploader.destroy(publicId);
//         console.log(`Image deleted successfully: ${publicId}`);
//     } catch (error) {
//         console.error("Failed to delete image from Cloudinary:", error);
//     }
// };


const deleteImage = async (imageUrls) => {
    try {
        const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];

        for (const url of urls) {
            if (typeof url === "string") {
                const publicId = url.split("/").pop().split(".")[0];
                await cloudnary.uploader.destroy(publicId);
                console.log(`Image deleted successfully: ${publicId}`);
            }
        }
    } catch (error) {
        console.error("Failed to delete image(s) from Cloudinary:", error);
    }
};

module.exports = {
    uploadImage, deleteImage
}