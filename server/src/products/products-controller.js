const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const Product = require("./products-model.js");
const Category = require("../categorys/categorys-model.js");
const { deleteImage, uploadImage } = require("../../middleware/Uploads.js");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder.js");
const { default: mongoose } = require("mongoose");

// ─── Product type cache ───────────────────────────────────────────────────────
const productTypeCache = {};
const PRODUCT_TYPE_TTL = 5 * 60 * 1000;

// ✅ Clear cache when products change
const clearProductTypeCache = () => {
  Object.keys(productTypeCache).forEach(key => delete productTypeCache[key]);
  console.log('Product type cache cleared');
};

// ─── createSubProduct ─────────────────────────────────────────────────────────
exports.createSubProduct = catchAsyncErrors(async (req, res, next) => {
  const { name, type, categoryId, subcategoryId, price, sku } = req.body;
  console.log("Request Body: ", req.body);
  if (!name || !price || !type || !categoryId || !subcategoryId) {
    return next(new ErrorHandler("All required fields must be filled.", 400));
  }

  const productImages = [];
  const files = req?.files || [];
  for (const file of files) {
    const uploadedImage = await uploadImage(file.path);
    productImages.push(uploadedImage);
    deleteLocalFile(file.path);
  }

  const newProduct = await Product.create({ sku, productName: name, price, type, categoryId: subcategoryId, mainCategoryId: categoryId, images: productImages });

  clearProductTypeCache(); // ✅ clear cache on create
  res.status(201).json({ success: true, message: "Product created successfully!", data: newProduct });
});

// ─── updateProductByID ────────────────────────────────────────────────────────
exports.updateProductByID = catchAsyncErrors(async (req, res, next) => {
  const productID = req.params.id;
  const { name, price, type, categoryId, subcategoryId, sku } = req.body;
  console.log("Product Update Request: ", req?.body);

  if (!name || !price || !type || !categoryId) {
    return next(new ErrorHandler("All required fields must be filled.", 400));
  }

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
    { productName: name, price, categoryId: subcategoryId, mainCategoryId: categoryId, type, sku, images: imageUrls.length > 0 ? imageUrls : existingProduct.images },
    { new: true, runValidators: true }
  );

  clearProductTypeCache(); // ✅ clear cache on update
  res.status(200).json({ success: true, message: "Product Updated Successfully", data: updatedProduct });
});

// ─── getAllProductsWithPagination ─────────────────────────────────────────────
exports.getAllProductsWithPagination = catchAsyncErrors(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || "";
    console.log("search===>", search)
    let query = {};

    if (search) {
      const conditions = [];
      conditions.push({ productName: { $regex: search, $options: "i" } });
      conditions.push({ sku: { $regex: search, $options: "i" } });
      conditions.push({ type: { $regex: search, $options: "i" } });
      if (!isNaN(Number(search))) conditions.push({ price: Number(search) });
      if (["true", "false"].includes(search.toLowerCase())) {
        const boolVal = search.toLowerCase() === "true";
        conditions.push({ status: boolVal });
      }
      if (mongoose.Types.ObjectId.isValid(search)) {
        const objId = new mongoose.Types.ObjectId(search);
        conditions.push({ mainCategoryId: objId });
        conditions.push({ categoryId: { $in: [objId] } });
      }
      if (conditions.length > 0) query = { $or: conditions };
    }

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("categoryId")
      .populate("mainCategoryId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: products,
      pagination: { totalProducts, totalPages: Math.ceil(totalProducts / limit), currentPage: page, limit },
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ─── getAllProducts ────────────────────────────────────────────────────────────
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  try {
    const products = await Product.find({}).populate("categoryId").populate("mainCategoryId").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ─── typeProducts ─────────────────────────────────────────────────────────────
exports.typeProducts = catchAsyncErrors(async (req, res, next) => {
  try {
    const { type, productId } = req.body;
    const products = await Product.findByIdAndUpdate(productId, { type })
      .populate("categoryId")
      .populate("mainCategoryId")
      .sort({ createdAt: -1 });
    clearProductTypeCache(); // ✅ clear cache on type change
    res.status(200).json({ massage: "Product Type Updated Successfully", success: true, data: products });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ─── changeStatus ─────────────────────────────────────────────────────────────
exports.changeStatus = catchAsyncErrors(async (req, res, next) => {
  try {
    const { productId, status } = req.body;
    const products = await Product.findByIdAndUpdate(productId, { status })
      .populate("categoryId")
      .populate("mainCategoryId")
      .sort({ createdAt: -1 });
    clearProductTypeCache(); // ✅ clear cache on status change
    res.status(200).json({ massage: "Product Status Updated Successfully", success: true, data: products });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ─── getProductByID ───────────────────────────────────────────────────────────
exports.getProductByID = catchAsyncErrors(async (req, res, next) => {
  try {
    const productID = req.params.id;
    const product = await Product.findOne({ _id: productID }).populate("categoryId").populate("mainCategoryId").sort({ createdAt: -1 });
    sendResponse(res, 200, "Product Fetched Successfully", product);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ─── deleteProductByID ────────────────────────────────────────────────────────
exports.deleteProductByID = catchAsyncErrors(async (req, res, next) => {
  try {
    const productID = req.params.id;
    const productData = await Product.findById(productID);
    if (!productData) return next(new ErrorHandler("Product not found", 400));
    if (productData?.images) {
      for (let oldImage of productData.images) await deleteImage(oldImage);
    }
    const product = await Product.deleteOne({ _id: productID });
    clearProductTypeCache(); // ✅ clear cache on delete
    res.status(200).json({ message: "Product deleted successfully", success: true, data: product });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ─── changeStockStatus ────────────────────────────────────────────────────────
exports.changeStockStatus = catchAsyncErrors(async (req, res, next) => {
  try {
    const { productId, isActive } = req.body;
    const products = await Product.findByIdAndUpdate(productId, { isActive })
      .populate("categoryId")
      .sort({ createdAt: -1 });
    res.status(200).json({ massage: "Product Stock Updated Successfully", success: true, data: products });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ─── getAllProductsByType ─────────────────────────────────────────────────────
exports.getAllProductsByType = catchAsyncErrors(async (req, res, next) => {
  const { term } = req.params;
  try {
    const cached = productTypeCache[term];
    if (cached && Date.now() - cached.time < PRODUCT_TYPE_TTL) {
      return res.status(200).json(cached.data);
    }

    const products = await Product.find({ type: term })
      .select("productName images price type categoryId mainCategoryId status sku")
      .populate("categoryId", "name images")
      .sort({ createdAt: -1 })
      .lean();

    const result = { success: true, count: products.length, products };
    productTypeCache[term] = { data: result, time: Date.now() };
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching products by type:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products by type" });
  }
});

// ─── searchProduct ────────────────────────────────────────────────────────────
exports.searchProduct = catchAsyncErrors(async (req, res, next) => {
  const { term } = req.params;
  try {
    const matchingCategories = await Category.find({ name: { $regex: term, $options: "i" } }).select("_id");
    const matchingCategoryIds = matchingCategories.map(cat => cat._id);
    const searchConditions = [
      { productName: { $regex: term, $options: "i" } },
      { type: { $regex: term, $options: "i" } },
    ];
    if (!isNaN(Number(term))) searchConditions.push({ price: Number(term) });
    if (matchingCategoryIds.length > 0) searchConditions.push({ categoryId: { $in: matchingCategoryIds } });
    const products = await Product.find({ $or: searchConditions }).populate("categoryId").populate("mainCategoryId");
    sendResponse(res, 200, "Product Fetched Successfully", { products });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// ─── getProductsByCategory ────────────────────────────────────────────────────
exports.getProductsByCategory = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const products = await Product.find({ categoryId: id }).populate("categoryId").populate("mainCategoryId");
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

