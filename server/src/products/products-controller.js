const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const Product = require("./products-model.js");
const Category = require("../categorys/categorys-model.js")
const { deleteImage, uploadImage } = require("../../middleware/Uploads.js");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder.js");


exports.createSubProduct = catchAsyncErrors(async (req, res, next) => {
    try {
        const { productName, type, categoryId, price } = req.body;
        console.log("Request Body: ", req.body);

        // Basic validation
        if (!productName || !price || !type || !categoryId) {
            return next(new ErrorHandler("All required fields must be filled.", 400));
        }

        // Parse incoming values (from form-data as stringified arrays)
        const parsedTypes = typeof type === "string" ? JSON.parse(type) : type;
        const parsedCategoryId = typeof categoryId === "string" ? JSON.parse(categoryId) : categoryId;

        // Upload Images
        console.log("Product Images: ", req.files);
        const productImages = [];
        const files = req?.files || [];

        for (const file of files) {
            const uploadedImage = await uploadImage(file.path); // Cloudinary upload
            productImages.push(uploadedImage);
            deleteLocalFile(file.path); // Remove local temp file
        }

        console.log("productImages: ", productImages);
        // Create product
        const newProduct = await Product.create({
            productName,
            price,
            type: parsedTypes,
            categoryId: parsedCategoryId,
            images: productImages
        });

        res.status(200).json({
            success: true,
            message: "Product created successfully!",
            data: newProduct
        });

    } catch (error) {
        console.error("Product creation error:", error);

        // Cleanup uploaded files on failure
        if (req.files?.productImages) {
            for (const file of req.files.productImages) { deleteLocalFile(file.path); }
        }

        return next(new ErrorHandler("Failed to create product. " + error.message, 500));
    }
});

exports.updateProductByID = catchAsyncErrors(async (req, res, next) => {
    const productID = req.params.id;

    const { productName, price, type, categoryId } = req.body;
    console.log("Product Update Request: ", req?.body);

    if (!productName || !price || !type || !categoryId) {
        return next(new ErrorHandler("All required fields must be filled.", 400));
    }
    const parsedTypes = typeof type === "string" ? JSON.parse(type) : type;
    const parsedCategoryId = typeof categoryId === "string" ? JSON.parse(categoryId) : categoryId;

    const existingProduct = await Product.findById(productID);
    if (!existingProduct) {
        return next(new ErrorHandler("Product not found!", 404));
    }

    const imageUrls = [];
    const productFiles = req?.files || [];

    if (req.files && req.files.length > 0) {
        for (let oldImage of existingProduct.images) {
            await deleteImage(oldImage);
        }

        for (let file of productFiles) {
            const imageUrl = await uploadImage(file.path);
            imageUrls.push(imageUrl);
            deleteLocalFile(file.path);
        }
    }
    const updatedProduct = await Product.findByIdAndUpdate(
        productID,
        {
            productName,
            price,
            categoryId: parsedCategoryId,
            type: parsedTypes,
            images: imageUrls.length > 0 ? imageUrls : existingProduct.images, // Retain old images if no new ones
        },
        { new: true, runValidators: true }
    );

    // Return the updated product
    res.status(200).json({ success: true, message: "Product Updated Successfully", data: updatedProduct, });
});

exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    try {
        const products = await Product.find({}).populate("categoryId").sort({ createdAt: -1 })

        res.status(200).json({ success: true, data: products, });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.typeProducts = catchAsyncErrors(async (req, res, next) => {
    try {
        const { type, productId } = req.body;
        const products = await Product.findByIdAndUpdate(productId, { type }).populate("categoryId").sort({ createdAt: -1 })
        res.status(200).json({ massage: "Product Type Updated Successfully", success: true, data: products });
        // sendResponse(res, 200, "Product Fetched Successfully", products);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.changeStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        const { productId, status } = req.body;
        const products = await Product.findByIdAndUpdate(productId, { status }).populate("categoryId").sort({ createdAt: -1 })
        res.status(200).json({ massage: "Product Status Updated Successfully", success: true, data: products });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getProductByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const productID = req.params.id;
        const product = await Product.findOne({ _id: productID }).populate("categoryId").sort({ createdAt: -1 })

        sendResponse(res, 200, "Product Fetched Successfully", product);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

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
        const products = await Product.findByIdAndUpdate(productId, { isActive }).populate("categoryId").sort({ createdAt: -1 })
        res.status(200).json({ massage: "Product Stock Updated Successfully", success: true, data: products });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getAllProductsByType = catchAsyncErrors(async (req, res, next) => {
    const { term } = req.params;

    try {
        const products = await Product.find({ type: term }).populate("categoryId").sort({ createdAt: -1 })

        res.status(200).json({ success: true, count: products.length, products, });
    } catch (error) {
        console.error("Error fetching products by type:", error);
        res.status(500).json({ success: false, message: "Failed to fetch products by type", });
    }
});

exports.searchProduct = catchAsyncErrors(async (req, res, next) => {
    const { term } = req.params;
    try {
        // Search matching categories
        const matchingCategories = await Category.find({
            name: { $regex: term, $options: 'i' }
        }).select('_id');

        const matchingCategoryIds = matchingCategories.map(cat => cat._id);
        const searchConditions = [
            { productName: { $regex: term, $options: 'i' } },
            { type: { $regex: term, $options: 'i' } },
            { price: { $regex: term, $options: 'i' } },
        ];

        if (!isNaN(term)) {
            searchConditions.push({ price: Number(term) });
        }

        if (matchingCategoryIds.length > 0) {
            searchConditions.push({ categoryId: { $in: matchingCategoryIds } });
        }
        const products = await Product.find({ $or: searchConditions }).populate("categoryId");
        sendResponse(res, 200, "Product Fetched Successfully", { products });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});