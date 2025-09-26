const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const WishList = require("./wishList-model");
const ShortUniqueId = require("short-unique-id");

exports.createWishList = catchAsyncErrors(async (req, res, next) => {
    try {
        const { productId, userId, status ,quantity} = req.body;
        console.log("BODY:=>", req.body)
        if (!productId || !userId) {
            return next(new ErrorHandler("Product ID and User ID are required", 400));
        }

        const existingWishList = await WishList.findOne({ productId, userId });

        if (existingWishList) {
            if (status === false) {
                await WishList.deleteOne({ productId, userId });
                return res.status(200).json({ success: true, message: "Wishlist item removed successfully" });
            }

            return res.status(200).json({ success: true, message: "Wishlist item already exists", data: existingWishList });
        }

        const newWishList = await WishList.create({ productId, userId, status,quantity });

        return res.status(201).json({ success: true, message: "Wishlist item added successfully", data: newWishList });

    } catch (error) {
        console.error("Create Wishlist Error:", error);
        return next(new ErrorHandler("Something went wrong while handling wishlist", 500));
    }
});

exports.updateWishList = catchAsyncErrors(async (req, res, next) => {
    try {
        const ID = req.params.id;
        const { productId, userId, status, quantity } = req.body;

        console.log("BODY:=>", req.body, "ID:", ID);

        // Validate inputs
        if (!productId || !userId) {
            return next(new ErrorHandler("Product ID and User ID are required", 400));
        }

        // Find existing wishlist item by ID
        let existingWishList = await WishList.findById(ID);
        if (!existingWishList) {
            return next(new ErrorHandler("Wishlist item not found", 404));
        }

        // Update fields
        existingWishList.productId = productId || existingWishList.productId;
        existingWishList.userId = userId || existingWishList.userId;
        existingWishList.status = status !== undefined ? status : existingWishList.status;
        if (quantity !== undefined) existingWishList.quantity = quantity || existingWishList.quantity; // ✅ only if you add quantity field in schema
        existingWishList.updatedAt = Date.now();

        await existingWishList.save();

        return res.status(200).json({ success: true, message: "Wishlist updated successfully", data: existingWishList, });

    } catch (error) {
        console.error("Update Wishlist Error:", error);
        return next(new ErrorHandler("Something went wrong while updating wishlist", 500));
    }
});



exports.getAllWishLists = catchAsyncErrors(async (req, res, next) => {
    try {
        const { pageNumber } = req.query;
        const totalWishLists = await WishList.countDocuments();

        const sizes = await WishList.find({}).populate("productId").populate("userId").sort({ createdAt: -1 }).skip((pageNumber - 1) * 15).limit(15)

        res.status(200).json({ success: true, data: sizes, totalWishLists, totalPages: Math.ceil(totalWishLists / 15), currentPage: parseInt(pageNumber, 10) });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.deleteWishlistByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const wishListID = req.params.id;
        const wishLists = await WishList.findByIdAndDelete(wishListID)
        res.status(200).json({ massage: "Wish Lists Deleted Successfully", success: true, data: wishLists });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getAllWishListById = catchAsyncErrors(async (req, res, next) => {
    try {
        const userID = req.params.id;
        const WishLists = await WishList.find({ userId: userID })

        sendResponse(res, 200, "Wish Lists Fetched Successfully", WishLists);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})
