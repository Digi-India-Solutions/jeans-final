const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const fs = require('fs');
const path = require("path");
const Product = require("./products-model.js");
const { deleteImage, uploadImage } = require("../../middleware/Uploads.js");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder.js");


exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    try {
        const { productName, productDescription, Variant, type, categoryId } = req.body;

        if (!productName || !productDescription || !type || !categoryId) {
            return next(new ErrorHandler("All required fields must be filled.", 400));
        }

        // const images = req.files?.map((file) => file.filename) || [];
        const imageUrls = [];
        for (let file of req.files) {
            const imageUrl = await uploadImage(file.path);
            imageUrls.push(imageUrl);
            deleteLocalFile(file.path); // Clean up local file
        }


        const parsedVariants = typeof Variant === "string" ? JSON.parse(Variant) : Variant;
        const parsedTypes = typeof type === "string" ? JSON.parse(type) : type;
        const parsedCategoryId = typeof categoryId === "string" ? JSON.parse(categoryId) : categoryId;

        const newProduct = await Product.create({ productName, productDescription, categoryId: parsedCategoryId, Variant: parsedVariants, type: parsedTypes, images:imageUrls, });

        res.status(200).json({ success: true, data: newProduct });
    } catch (error) {
        if (req.files) {
            // Ensure image deletion on failure for all uploaded images
            req.files.forEach(file => deleteImage(file.path));
        }
        console.error("Product Creation Error:", error);
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    try {
        const { pageNumber } = req.query;
        const totalProducts = await Product.countDocuments();

        const products = await Product.find({}).populate("Variant.color").populate("Variant.sizes").populate("categoryId").sort({ createdAt: -1 })

        res.status(200).json({ success: true, data: products, });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.typeProducts = catchAsyncErrors(async (req, res, next) => {
    try {
        const { type, productId } = req.body;
        const products = await Product.findByIdAndUpdate(productId, { type }).populate("Variant.color").populate("Variant.sizes").populate("categoryId").sort({ createdAt: -1 })
        res.status(200).json({ massage: "Product Type Updated Successfully", success: true, data: products });
        // sendResponse(res, 200, "Product Fetched Successfully", products);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.changeStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        const { productId, status } = req.body;
        const products = await Product.findByIdAndUpdate(productId, { status }).populate("Variant.color").populate("Variant.sizes").populate("categoryId").sort({ createdAt: -1 })
        res.status(200).json({ massage: "Product Status Updated Successfully", success: true, data: products });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getProductByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const productID = req.params.id;
        const product = await Product.findOne({ _id: productID }).populate("Variant.color").populate("Variant.sizes").populate("categoryId").sort({ createdAt: -1 })

        sendResponse(res, 200, "Product Fetched Successfully", product);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.updateProductByID = catchAsyncErrors(async (req, res, next) => {
    const productID = req.params.id;

    const { productName, productDescription, Variant, type, categoryId, oldProductImages } = req.body;

    if (!productName || !productDescription || !type || !categoryId) {
        return next(new ErrorHandler("All required fields must be filled.", 400));
    }

    const parsedVariants = typeof Variant === "string" ? JSON.parse(Variant) : Variant;
    const parsedTypes = typeof type === "string" ? JSON.parse(type) : type;
    const parsedCategoryId = typeof categoryId === "string" ? JSON.parse(categoryId) : categoryId;

   
    const existingProduct = await Product.findById(productID);
    if (!existingProduct) {
        return next(new ErrorHandler("Product not found!", 404));
    }
    const imageUrls = [];

    if (req.files && req.files.length > 0) {
        // Delete old images from Cloudinary before updating
        for (let oldImage of existingProduct.images) {
            await deleteImage(oldImage);
        }

        for (let file of req.files) {
            const imageUrl = await uploadImage(file.path);
            imageUrls.push(imageUrl);
            deleteLocalFile(file.path); // Clean up local file
        }
    }

    // ✨ Update product
    const updatedProduct = await Product.findByIdAndUpdate(
        productID,
        { productName, productDescription, categoryId: parsedCategoryId, Variant: parsedVariants, type: parsedTypes, images: imageUrls.length > 0 ? imageUrls : existingProduct.images, },
        { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, message: "Product Updated Successfully", data: updatedProduct, });
});


exports.deleteProductByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const productID = req.params.id;

        const productData = await Product.findById(productID);
        if (!productData) {
            return next(new ErrorHandler("Product not found", 400));
        }

        if (productData?.images) {
            for (let oldImage of productData.images) {
                await deleteImage(oldImage);
            }
    
        }
        const product = await Product.deleteOne({ _id: productID });
        res.status(200).json({ message: "Product deleted successfully", success: true, data: product });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.changeStockStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        const { productId, isActive } = req.body;
        const products = await Product.findByIdAndUpdate(productId, { isActive }).populate("Variant.color").populate("Variant.sizes").populate("categoryId").sort({ createdAt: -1 })
        res.status(200).json({ massage: "Product Stock Updated Successfully", success: true, data: products });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getAllProductsByType = catchAsyncErrors(async (req, res, next) => {
    const { term } = req.params;

    try {
        const products = await Product.find({ type: term }).populate("Variant.color").populate("Variant.sizes").populate("categoryId").sort({ createdAt: -1 })

        res.status(200).json({ success: true, count: products.length, products, });
    } catch (error) {
        console.error("Error fetching products by type:", error);
        res.status(500).json({ success: false, message: "Failed to fetch products by type", });
    }
});

// exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const products = await Product.find({})
//         res.status(200).json({ success: true, message: "Product Fetched Successfully", data: products });
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// })


// exports.getAllProductsForOptions = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const products = await Product.find({}).sort({ createdAt: -1 })
//         sendResponse(res, 200, "Product Fetched Successfully", products);
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// })


// exports.getProductForCart = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const productID = req.body.productId;

//         const product = await Product.find({ _id: productID })
//             .populate("accessories");

//         sendResponse(res, 200, "Product Fetched Successfully", product);
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// })

// exports.searchProduct = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { term } = req.params;
//         const { pageNumber } = req.query;
//         const query = {
//             $or: [
//                 { name: { $regex: term, $options: 'i' } },
//                 { uniqueProductId: { $regex: term, $options: 'i' } },
//                 { price: { $regex: term, $options: 'i' } },
//                 { imeiNo: { $regex: term, $options: 'i' } },
//             ]
//         }

//         const totalProducts = await Product.countDocuments(query)

//         const products = await Product.find(query)
//             .sort({ createdAt: -1 })
//             .skip((pageNumber - 1) * 15)
//             .limit(15)
//             .populate("accessories");


//         sendResponse(res, 200, "Product Fetched Successfully", {
//             products,
//             totalProducts,
//             totalPage: Math.ceil(totalProducts / 15)
//         });
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// })