const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (image) => {
  try {
    const result = await cloudinary.uploader.upload(image);

    if (result) {
      fs.unlink(image, (err) => {
        if (err) {
          console.log("fs delete image error", err);
        }
      });
      return result.secure_url;
    }
  } catch (error) {
    console.log("cloudinary error", error);
    return null;
  }
};

const uploadVideoOnCloudinary = async (video) => {
  try {
    const result = await cloudinary.uploader.upload(video, {
      resource_type: "video",
      folder: "videos",
    });
    if (result) {
      fs.unlink(video, (err) => {
        if (err) {
          console.log("fs delete video error", err);
        }
      });
    }
    return result.secure_url;
  } catch (error) {
    console.log("cloudinary video error", error);
    return null;
  }
};

function extractPublicIdFromUrl(cloudinaryUrl) {
  if (!cloudinaryUrl || typeof cloudinaryUrl !== "string") return null;

  try {
    const url = new URL(cloudinaryUrl);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const uploadIndex = pathParts.findIndex((part) => part === "upload");

    if (uploadIndex === -1 || uploadIndex + 1 >= pathParts.length) return null;

    let assetParts = pathParts.slice(uploadIndex + 1);

    if (assetParts[0] && assetParts[0].startsWith("v")) {
      assetParts = assetParts.slice(1);
    }

    if (assetParts.length === 0) return null;

    const last = assetParts[assetParts.length - 1];
    assetParts[assetParts.length - 1] = last.replace(/\.[^.]+$/, "");

    return assetParts.join("/");
  } catch (error) {
    const parts = cloudinaryUrl.split("/");
    const filenameWithExt = parts[parts.length - 1] || "";
    return filenameWithExt.split(".")[0] || null;
  }
}

const deleteFromCloudinary = async (image) => {
  try {
    const publicId = extractPublicIdFromUrl(image);
    if (!publicId) return null;

    const result = await cloudinary.uploader.destroy(publicId);
    if (result) {
      console.log("cloudinary delete result", result);
    }
    return result;
  } catch (error) {
    throw new Error("Cloudinary deletion failed: " + error.message);
  }
};

module.exports = {
  uploadOnCloudinary,
  uploadVideoOnCloudinary,
  deleteFromCloudinary,
};