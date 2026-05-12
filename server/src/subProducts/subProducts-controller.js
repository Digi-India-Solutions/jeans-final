const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const fs = require('fs');
const path = require("path");
const Product = require("../products/products-model.js");
const SubProduct = require("./subProducts-model.js");
const Category = require("../categorys/categorys-model.js")
const Color = require("../colors/colors-model.js");
const Size = require("../sizes/sizes-model.js");
const Wishlist = require("../wishLists/wishList-model.js");
const Cart = require("../addToCard/card-model.js");
const { deleteImage, uploadImage } = require("../../middleware/Uploads.js");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder.js");


exports.createSubProduct = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log("FILES", req.files);
        console.log("BODY==>", req.body);
        const { selectedSizes } = req.body;
        const data = req.body;
        const productImages = [];
        const files = req?.files || [];

        for (const file of files) {
            const uploadedImage = await uploadImage(file.path);
            productImages.push(uploadedImage);
            deleteLocalFile(file.path);
        }
        // const sizes = JSON.parse(data.sizes)

        const newSubProduct = new SubProduct({ ...data, sizes: selectedSizes, subProductImages: productImages });
        await newSubProduct.save();
        return res.status(201).json({ success: true, message: 'SubProduct created successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Something went wrong' });
    }
});

exports.getAllSubProducts = catchAsyncErrors(async (req, res, next) => {
    try {
        const subProducts = await SubProduct.find().populate([{ path: "productId", populate: { path: "categoryId", } }, { path: "sizes" }]).lean();
        return res.status(200).json({ success: true, data: subProducts });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Something went wrong' });
    }
});


// exports.getAllSubProductsWithPagination = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 10;
//         const skip = (page - 1) * limit;
//         const search = req.query.search?.trim() || "";

//         // 🔎 Build search query
//         let query = {};
//         if (search) {
//             const numericSearch = !isNaN(Number(search)) ? Number(search) : null;

//             query = {
//                 $or: [
//                     { name: { $regex: search, $options: "i" } },
//                     { lotNumber: { $regex: search, $options: "i" } },
//                     { "productId.productName": { $regex: search, $options: "i" } },
//                     { barcode: { $regex: search, $options: "i" } },
//                     { stock: { $regex: search, $options: "i" } },
//                     { description: { $regex: search, $options: "i" } },
//                     ...(numericSearch !== null ? [{ singlePicPrice: numericSearch }] : [])
//                 ]
//             };
//         }

//         // 📊 Count total documents with query
//         const totalSubProducts = await SubProduct.countDocuments(query);

//         // 📦 Fetch paginated + populated sub-products
//         const subProducts = await SubProduct.find(query)
//             .populate([
//                 {
//                     path: "productId",
//                     populate: { path: "categoryId" }
//                 },
//                 { path: "sizes" }
//             ])
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(limit)
//             .lean(); // return plain JS objects


//         // ✅ Return response
//         return res.status(200).json({
//             success: true,
//             data: subProducts,
//             pagination: { totalSubProducts, totalPages: Math.ceil(totalSubProducts / limit), currentPage: page, limit }
//         });
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// });

exports.getAllSubProductsWithPagination = catchAsyncErrors(async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const skip = (page - 1) * limit;
        const search = req.query.search?.trim() || "";
        const category = req.query.category?.trim() || "";  // mainCategoryId _id
        const subCategory = req.query.subCategory?.trim() || "";  // categoryId (sub) _id
        const status = req.query.status?.trim() || "";  // "In Stock" | "Low Stock" | "Out of Stock"

        // ─── Build base query ─────────────────────────────────────────────────

        let query = {};

        // 🔎 Text search across common fields
        if (search) {
            const numericSearch = !isNaN(Number(search)) ? Number(search) : null;
            query.$or = [
                { color: { $regex: search, $options: "i" } },
                { lotNumber: { $regex: search, $options: "i" } },
                { barcode: { $regex: search, $options: "i" } },
                { stock: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                ...(numericSearch !== null
                    ? [{ singlePicPrice: numericSearch }, { lotStock: numericSearch }]
                    : []),
            ];
        }

        // 📦 Stock status filter (exact match — frontend sends label string)
        if (status) {
            query.stock = status;
        }

        // ─── Category + SubCategory filter ───────────────────────────────────
        // Product schema:
        //   mainCategoryId → Single ObjectId   ← filter by `category` param
        //   categoryId     → Array of ObjectIds ← filter by `subCategory` param
        //
        // IMPORTANT: When both are provided, we must INTERSECT the two productId
        // sets — NOT let the second block overwrite the first.
        // Strategy: collect each set independently, then take the intersection.

        if (category || subCategory) {
            let categoryProductIds = null; // null = "not filtered"
            let subCategoryProductIds = null;

            // ── Main category filter ──
            if (category) {
                const matched = await Product.find({ mainCategoryId: category })
                    .select("_id")
                    .lean();
                categoryProductIds = matched.map(p => p._id.toString());
            }

            // ── Sub-category filter ──
            // categoryId is an Array on Product — Mongoose/MongoDB handles
            // { categoryId: subCategory } as "array contains this value" natively.
            if (subCategory) {
                const matched = await Product.find({ categoryId: subCategory })
                    .select("_id")
                    .lean();
                subCategoryProductIds = matched.map(p => p._id.toString());

                console.log("matched==>", matched)
            }

            // ── Intersect both sets if both filters are active ──────────────
            let finalProductIds;

            if (categoryProductIds !== null && subCategoryProductIds !== null) {
                // Both active → intersection (products that satisfy BOTH conditions)
                const subCategorySet = new Set(subCategoryProductIds);
                finalProductIds = categoryProductIds.filter(id => subCategorySet.has(id));
            } else {
                // Only one active → use whichever is not null
                finalProductIds = categoryProductIds ?? subCategoryProductIds;
            }

            // ── Short-circuit if intersection is empty ──────────────────────
            if (finalProductIds.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: [],
                    pagination: {
                        totalSubProducts: 0,
                        totalPages: 0,
                        currentPage: page,
                        limit,
                    },
                });
            }

            query.productId = { $in: finalProductIds };
        }

        // ─── Count + fetch ─────────────────────────────────────────────────────

        const totalSubProducts = await SubProduct.countDocuments(query);

        const subProducts = await SubProduct.find(query)
            .populate([
                {
                    path: "productId",
                    populate: [
                        { path: "categoryId" },     // sub-categories array
                        { path: "mainCategoryId" }, // main category
                    ],
                },
                { path: "sizes" },
            ])
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // ─── Response ──────────────────────────────────────────────────────────

        return res.status(200).json({
            success: true,
            data: subProducts,
            pagination: {
                totalSubProducts,
                totalPages: Math.ceil(totalSubProducts / limit),
                currentPage: page,
                limit,
            },
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.changeSubStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        const { productId, status } = req.body;
        const products = await SubProduct.findByIdAndUpdate(productId, { status }).populate([{ path: "productId", populate: { path: "categoryId", } }, { path: "sizes" }]).sort({ createdAt: -1 })
        res.status(200).json({ massage: "Product Status Updated Successfully", success: true, data: products });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.changeStockStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        const { productId, isActive } = req.body;
        const products = await SubProduct.findByIdAndUpdate(productId, { isActive }).populate([{ path: "productId", populate: { path: "categoryId", } }, { path: "sizes" }]).sort({ createdAt: -1 })
        res.status(200).json({ massage: "Product Stock Updated Successfully", success: true, data: products });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getSubProductByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const productID = req.params.id;
        const product = await SubProduct.findOne({ _id: productID }).populate([{ path: "productId", populate: { path: "categoryId", } }, { path: "sizes" }]).lean()
        sendResponse(res, 200, "Product Fetched Successfully", product);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.updateSubProductByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const data = req.body;
        const { selectedSizes } = req.body

        const existingProduct = await SubProduct.findById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: "SubProduct not found" });
        }

        const uploadedImages = [];
        const productFiles = req.files || [];

        // Handle image replacement
        if (productFiles.length > 0) {
            // Delete old images from cloud
            for (const oldImage of existingProduct.subProductImages) {
                await deleteImage(oldImage);
            }

            // Upload new images in parallel
            const uploadPromises = productFiles.map(async (file) => {
                const imageUrl = await uploadImage(file.path);
                deleteLocalFile(file.path);
                return imageUrl;
            });

            const newImages = await Promise.all(uploadPromises);
            uploadedImages.push(...newImages);
        }

        const updatedFields = { ...data, subProductImages: existingProduct.subProductImages, sizes: selectedSizes, };

        if (uploadedImages.length > 0) {
            updatedFields.subProductImages = uploadedImages;
        }

        const updatedSubProduct = await SubProduct.findByIdAndUpdate(req.params.id, updatedFields, { new: true }).populate([
            { path: "productId", populate: { path: "categoryId" } },
            { path: "sizes" }]);

        return res.status(200).json({ success: true, message: "SubProduct updated successfully", data: updatedSubProduct });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Something went wrong' });
    }
});


exports.deleteSubProductByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const productID = req.params.id;

        // 1. Check product existence
        const productData = await SubProduct.findById(productID);
        if (!productData) {
            return next(new ErrorHandler("Product not found", 404));
        }

        // 2. Delete all product images
        if (productData.subProductImages && productData.subProductImages.length > 0) {
            for (const img of productData.subProductImages) {
                await deleteImage(img);
            }
        }

        // 3. Remove product from all wishlists
        await Wishlist.deleteMany({ productId: productID });

        // 4. Remove only matching items from all carts
        const carts = await Cart.find({ ["items.subProduct"]: productID });
        console.log("carts:==>", carts);

        for (const cart of carts) {

            // Remove only the matching subProduct
            cart.items = cart.items.filter(
                (item) => item.subProduct.toString() !== productID.toString()
            );

            // Recalculate total
            cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // If empty → delete the cart
            if (cart.items.length === 0) {
                await Cart.deleteOne({ _id: cart._id });
            } else {
                // Save updated cart
                await cart.save();
            }
        }

        // 5. Delete the sub-product
        await SubProduct.deleteOne({ _id: productID });

        res.status(200).json({ success: true, message: "Product deleted successfully" });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getAllSubProductsByType = catchAsyncErrors(async (req, res, next) => {
    const { term } = req.params;

    try {
        const products = await SubProduct.find()
            .populate([
                { path: "productId", populate: { path: "categoryId" }, },
                { path: "sizes", }]).sort({ createdAt: -1 });

        // Filter after population, because type is inside productId.type array
        const filteredProducts = products.filter((item) => item.productId?.type?.includes(term));

        res.status(200).json({ success: true, count: filteredProducts.length, products: filteredProducts, });
    } catch (error) {
        console.error("Error fetching products by type:", error);
        res.status(500).json({ success: false, message: "Failed to fetch products by type", });
    }
});

exports.getAllSubProductsByProductId = catchAsyncErrors(async (req, res, next) => {
    try {
        const productID = req.params.id;
        const product = await SubProduct.find({ productId: productID }).populate([
            { path: "productId", populate: { path: "categoryId" } },
            { path: "sizes" }]).sort({ createdAt: -1 }).lean();
        sendResponse(res, 200, "Product Fetched Successfully", product);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})
