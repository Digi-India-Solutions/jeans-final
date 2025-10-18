const cloudnary = require("cloudinary").v2

cloudnary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECKRET
})


const uploadImage = async (file) => {
    console.log('fileURL----------', file)
    try {
        const imageurl = await cloudnary.uploader.upload(file)
        // console.log('imageurl----------', imageurl)
        return imageurl.secure_url
    } catch (error) {
        console.log(error)
    }
}

const uploadsPdf = async (file) => {
  try {
    const uploadResponse = await cloudnary.uploader.upload(file, {
      folder: "catalogues",
      resource_type: "raw", // ✅ FIXED — ensures PDF works
      format: "pdf", // optional, helps Cloudinary recognize content type
    });
    return uploadResponse
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload file to Cloudinary");
  }
};

// const deletePdf = async (imageUrls) => {
//   try {
//     const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
//     for (const url of urls) {
//       if (typeof url === "string" && url.includes("/")) {
//         const parts = url.split("/");
//         const publicId = `${parts[parts.length - 2]}/${parts.pop().split(".")[0]}`;
//         await cloudinary.uploader.destroy(publicId, { resource_type: "raw" }); // ✅ raw for PDFs
//         console.log(`File deleted: ${publicId}`);
//       }
//     }
//   } catch (error) {
//     console.error("Failed to delete file(s) from Cloudinary:", error);
//   }
// };



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
    uploadImage, deleteImage ,uploadsPdf
}