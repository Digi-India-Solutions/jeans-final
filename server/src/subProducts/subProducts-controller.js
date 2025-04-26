const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const fs = require('fs');
const path = require("path");
// const Product = require("./subProducts-model.js");
const SubProduct = require("./subProducts-model.js");
const Category = require("../categorys/categorys-model.js")
const Color = require("../colors/colors-model.js");
const Size = require("../sizes/sizes-model.js");
const { deleteImage, uploadImage } = require("../../middleware/Uploads.js");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder.js");


exports.createSubProduct = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log("FILES", req.files);
        console.log("BODY", req.body);
        const data = req.body;
        const productImages = [];
        const files = req?.files || [];

        for (const file of files) {
            const uploadedImage = await uploadImage(file.path);
            productImages.push(uploadedImage);
            deleteLocalFile(file.path);
        }
        const sizes = JSON.parse(data.sizes)

        const newSubProduct = new SubProduct({ ...data, sizes: sizes, productId: data.productID, subProductImages: productImages });
        await newSubProduct.save();
        return res.status(201).json({ success: true, message: 'SubProduct created successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Something went wrong' });
    }
});


exports.getAllSubProducts = catchAsyncErrors(async (req, res, next) => {
    try {
        const subProducts = await SubProduct.find().populate([{ path: "productId", populate: { path: "categoryId", } }, { path: "sizes" }]);
        return res.status(200).json({ success: true, data: subProducts });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Something went wrong' });
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
        const product = await SubProduct.findOne({ _id: productID }).populate([{ path: "productId", populate: { path: "categoryId", } }, { path: "sizes" }]).sort({ createdAt: -1 })
        sendResponse(res, 200, "Product Fetched Successfully", product);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.updateSubProductByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const data = req.body;

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

        // Handle sizes
        let sizes = [];
        if (data.sizes) {
            try {
                sizes = Array.isArray(data.sizes) ? data.sizes : JSON.parse(data.sizes);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid sizes format" });
            }
        }

        // Prepare updated fields
        const updatedFields = { ...data, sizes, productId: data.productId || data.productID, };

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

        const productData = await SubProduct.findById(productID);
        if (!productData) {
            return next(new ErrorHandler("Product not found", 400));
        }

        if (productData?.subProductImages) {
            for (let oldImage of productData.subProductImages) {
                await deleteImage(oldImage);
            }

        }
        const product = await SubProduct.deleteOne({ _id: productID });
        res.status(200).json({ message: "Product deleted successfully", success: true, data: product });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

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
            { path: "sizes" }]).sort({ createdAt: -1 });
        sendResponse(res, 200, "Product Fetched Successfully", product);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// exports.searchProduct = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { term } = req.params;

//         // Match category names
//         const matchingCategories = await Category.find({
//             name: { $regex: term, $options: 'i' }
//         }).select('_id');
//         const matchingCategoryIds = matchingCategories.map(cat => cat._id);

//         // Match color names
//         const matchingColors = await Color.find({
//             colorName: { $regex: term, $options: 'i' }
//         }).select('_id');
//         const matchingColorIds = matchingColors.map(c => c._id);

//         // Match size names
//         const matchingSizes = await Size.find({
//             size: { $regex: term, $options: 'i' }
//         }).select('_id');
//         const matchingSizeIds = matchingSizes.map(s => s._id);

//         // Build the search query
//         const query = {
//             $or: [
//                 { productName: { $regex: term, $options: 'i' } },
//                 { type: { $regex: term, $options: 'i' } },
//                 { "Variant.finalPrice": !isNaN(term) ? Number(term) : undefined },
//                 { categoryId: { $in: matchingCategoryIds } },
//                 { "Variant.color": { $in: matchingColorIds } },
//                 { "Variant.sizes": { $in: matchingSizeIds } },
//             ].filter(Boolean)
//         };

//         // Find and populate related fields
//         const products = await Product.find(query)
//             .populate("categoryId")
//             .populate("Variant.sizes");

//         console.log("products:-------s", products.length)
//         sendResponse(res, 200, "Product Fetched Successfully", { products });
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// });

// exports.createProduct = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { productName, productDescription, Variant, type, categoryId } = req.body;
//         console.log("XXXXXXXXXXX:==", req?.body)
//         // Basic validation
//         if (!productName || !productDescription || !type || !categoryId) {
//             return next(new ErrorHandler("All required fields must be filled.", 400));
//         }

//         // Safe parsing for frontend JSON-encoded arrays/objects
//         const parsedVariants = typeof Variant === "string" ? JSON.parse(Variant) : Variant;
//         const parsedTypes = typeof type === "string" ? JSON.parse(type) : type;
//         const parsedCategoryId = typeof categoryId === "string" ? JSON.parse(categoryId) : categoryId;

//         // Separate image uploads
//         const productImages = [];
//         const variantImages = [];

//         // Split files: assume frontend sends files under fieldname 'productImages' and 'variantImages'
//         const allFiles = req.files || [];
//         console.log("XXXXXXXXXXX:==", req?.files?.productImages)

//         const productFiles = req?.files?.productImages;
//         const variantFiles = req?.files?.variantImages;

//         for (let file of productFiles) {
//             const url = await uploadImage(file.path);
//             productImages.push(url);
//             deleteLocalFile(file.path);
//         }

//         for (let i = 0; i < parsedVariants.length; i++) {
//             const variantImageFile = variantFiles[i];
//             if (variantImageFile) {
//                 const imageUrl = await uploadImage(variantImageFile.path);
//                 parsedVariants[i].productSingleImage = imageUrl;
//                 deleteLocalFile(variantImageFile.path);
//             } else {
//                 parsedVariants[i].productSingleImage = "";
//             }
//         }

//         const newProduct = await Product.create({
//             productName,
//             productDescription,
//             categoryId: parsedCategoryId,
//             type: parsedTypes,
//             Variant: parsedVariants,
//             images: productImages
//         });

//         res.status(200).json({ success: true, data: newProduct });

//     } catch (error) {
//         console.error("Product Creation Error:", error);

//         // Clean up local files on error
//         if (req.files) {
//             req.files.forEach(file => deleteImage(file.path));
//         }

//         return next(new ErrorHandler("Failed to create product. " + error.message, 500));
//     }
// });



// exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { pageNumber } = req.query;
//         const totalProducts = await Product.countDocuments();

//         const products = await Product.find({}).populate("Variant.sizes").populate("categoryId").sort({ createdAt: -1 })

//         res.status(200).json({ success: true, data: products, });
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// })

// exports.typeProducts = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { type, productId } = req.body;
//         const products = await Product.findByIdAndUpdate(productId, { type }).populate("Variant.sizes").populate("categoryId").sort({ createdAt: -1 })
//         res.status(200).json({ massage: "Product Type Updated Successfully", success: true, data: products });
//         // sendResponse(res, 200, "Product Fetched Successfully", products);
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// })

// exports.changeStatus = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { productId, status } = req.body;
//         const products = await Product.findByIdAndUpdate(productId, { status }).populate("Variant.sizes").populate("categoryId").sort({ createdAt: -1 })
//         res.status(200).json({ massage: "Product Status Updated Successfully", success: true, data: products });
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// })








// // exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
// //     try {
// //         const products = await Product.find({})
// //         res.status(200).json({ success: true, message: "Product Fetched Successfully", data: products });
// //     } catch (error) {
// //         return next(new ErrorHandler(error.message, 500));
// //     }
// // })


// // exports.getAllProductsForOptions = catchAsyncErrors(async (req, res, next) => {
// //     try {
// //         const products = await Product.find({}).sort({ createdAt: -1 })
// //         sendResponse(res, 200, "Product Fetched Successfully", products);
// //     } catch (error) {
// //         return next(new ErrorHandler(error.message, 500));
// //     }
// // })


// // exports.getProductForCart = catchAsyncErrors(async (req, res, next) => {
// //     try {
// //         const productID = req.body.productId;

// //         const product = await Product.find({ _id: productID })
// //             .populate("accessories");

// //         sendResponse(res, 200, "Product Fetched Successfully", product);
// //     } catch (error) {
// //         return next(new ErrorHandler(error.message, 500));
// //     }
// // })

