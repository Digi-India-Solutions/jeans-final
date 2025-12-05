const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const WishList = require("./wishList-model");
const ShortUniqueId = require("short-unique-id");

// exports.createWishList = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { productId, userId, status, quantity } = req.body;
//         console.log("BODY:=>", req.body)
//         if (!productId || !userId) {
//             return next(new ErrorHandler("Product ID and User ID are required", 400));
//         }
//         // WishList.items.push({
//         //                     subProduct: new mongoose.Types.ObjectId(newItem.subProduct),  // convert to ObjectId
//         //                     quantity: newItem.quantity,
//         //                     price: newItem.price,
//         //                     status: 'pending',
//         //                 });

//         const ExistWishListByUser = await WishList.findOne({ userId });
//         if (ExistWishListByUser) {

//         }

//         const existingWishList = await WishList.findOne({ productId, userId });

//         if (existingWishList) {
//             if (status === false) {
//                 await WishList.deleteOne({ productId, userId });
//                 return res.status(200).json({ success: true, message: "Wishlist item removed successfully" });
//             }

//             return res.status(200).json({ success: true, message: "Wishlist item already exists", data: existingWishList });
//         }

//         const newWishList = await WishList.create({ productId, userId, status, quantity });

//         return res.status(201).json({ success: true, message: "Wishlist item added successfully", data: newWishList });

//     } catch (error) {
//         console.error("Create Wishlist Error:", error);
//         return next(new ErrorHandler("Something went wrong while handling wishlist", 500));
//     }
// });

// exports.updateWishList = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const ID = req.params.id;
//         const { productId, userId, status, quantity } = req.body;

//         console.log("BODY:=>", req.body, "ID:", ID);

//         // Validate inputs
//         if (!productId || !userId) {
//             return next(new ErrorHandler("Product ID and User ID are required", 400));
//         }

//         // Find existing wishlist item by ID
//         let existingWishList = await WishList.findById(ID);
//         if (!existingWishList) {
//             return next(new ErrorHandler("Wishlist item not found", 404));
//         }

//         // Update fields
//         existingWishList.productId = productId || existingWishList.productId;
//         existingWishList.userId = userId || existingWishList.userId;
//         existingWishList.status = status !== undefined ? status : existingWishList.status;
//         if (quantity !== undefined) existingWishList.quantity = quantity || existingWishList.quantity; // ✅ only if you add quantity field in schema
//         existingWishList.updatedAt = Date.now();

//         await existingWishList.save();

//         return res.status(200).json({ success: true, message: "Wishlist updated successfully", data: existingWishList, });

//     } catch (error) {
//         console.error("Update Wishlist Error:", error);
//         return next(new ErrorHandler("Something went wrong while updating wishlist", 500));
//     }
// });



// exports.getAllWishLists = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { pageNumber } = req.query;
//         const totalWishLists = await WishList.countDocuments();

//         const sizes = await WishList.find({}).populate("productId").populate("userId").sort({ createdAt: -1 }).skip((pageNumber - 1) * 15).limit(15)

//         res.status(200).json({ success: true, data: sizes, totalWishLists, totalPages: Math.ceil(totalWishLists / 15), currentPage: parseInt(pageNumber, 10) });
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// });

// exports.deleteWishlistByID = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const wishListID = req.params.id;
//         const wishLists = await WishList.findByIdAndDelete(wishListID)
//         res.status(200).json({ massage: "Wish Lists Deleted Successfully", success: true, data: wishLists });
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// })

// exports.getAllWishListById = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const userID = req.params.id;
//         const WishLists = await WishList.find({ userId: userID })

//         sendResponse(res, 200, "Wish Lists Fetched Successfully", WishLists);
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// })



exports.createWishList = catchAsyncErrors(async (req, res, next) => {
    try {
        const { productId, userId, quantity, status } = req.body;
        console.log("BODY:=>", req.body)
        if (!productId || !userId) {
            return next(new ErrorHandler("Product ID, User ID & Price are required", 400));
        }

        let wishList = await WishList.findOne({ userId });

        // If wishlist exists
        if (wishList) {

            // Check if product already exists inside items[]
            const existingItem = wishList.items.find(
                (item) => item.productId.toString() === productId
            );

            // If already exists and status:false remove
            if (existingItem && status === false) {
                wishList.items = wishList.items.filter(
                    (item) => item.productId.toString() !== productId
                );
                await wishList.save();

                return res.status(200).json({
                    success: true,
                    message: "Product removed from wishlist"
                });
            }

            // If already exists -> return message
            if (existingItem) {
                return res.status(200).json({
                    success: true,
                    message: "Product already in wishlist",
                    data: wishList
                });
            }

            // Add new product to items[]
            wishList.items.push({
                productId,
                quantity: quantity || 1,
                status: status !== undefined ? status : true
            });

            await wishList.save();

            return res.status(201).json({
                success: true,
                message: "Product added to wishlist",
                data: wishList
            });
        }

        // If wishlist doesn't exist for user → create new
        const newWishlist = await WishList.create({
            userId,
            items: [{
                productId,
                quantity: quantity || 1,
                status: status !== undefined ? status : true
            }]
        });

        return res.status(201).json({
            success: true,
            message: "Wishlist created & product added",
            data: newWishlist
        });

    } catch (error) {
        console.log("Create Wishlist Error:", error);
        return next(new ErrorHandler("Something went wrong", 500));
    }
});

exports.updateWishList = catchAsyncErrors(async (req, res, next) => {
    try {
        const { wishlistId, productId } = req.params;
        const { quantity, price, status } = req.body;

        const wishList = await WishList.findById(wishlistId);
        if (!wishList) return next(new ErrorHandler("Wishlist not found", 404));

        const item = wishList.items.find(
            (it) => it.productId.toString() === productId
        );

        if (!item) return next(new ErrorHandler("Product not found in wishlist", 404));

        if (quantity !== undefined) item.quantity = quantity;
        if (price !== undefined) item.price = price;
        if (status !== undefined) item.status = status;

        await wishList.save();

        res.status(200).json({
            success: true,
            message: "Wishlist item updated",
            data: wishList
        });

    } catch (error) {
        return next(new ErrorHandler("Failed to update wishlist", 500));
    }
});

exports.getAllWishLists = catchAsyncErrors(async (req, res, next) => {
    try {
        const { pageNumber = 1 } = req.query;

        const total = await WishList.countDocuments();

        const data = await WishList.find()
            .populate("items.productId")
            .populate("userId")
            .skip((pageNumber - 1) * 15)
            .limit(15)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total,
            totalPages: Math.ceil(total / 15),
            currentPage: Number(pageNumber),
            data
        });
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
});

exports.deleteItemByID = catchAsyncErrors(async (req, res, next) => {

    try {
        const { wishlistId, productId } = req.params;

        const wishList = await WishList.findById(wishlistId);
        if (!wishList) return next(new ErrorHandler("Wishlist not found", 404));

        wishList.items = wishList.items.filter(
            (item) => item.productId.toString() !== productId
        );

        await wishList.save();

        res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getAllWishListById = catchAsyncErrors(async (req, res, next) => {
    try {
        const userId = req.params.id;

        const data = await WishList.findOne({ userId })
            .populate("items.productId")
            .populate("userId");

        sendResponse(res, 200, "Wishlist fetched successfully", data || []);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
