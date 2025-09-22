const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const Product = require("./products-model.js");
const Category = require("../categorys/categorys-model.js");
const { deleteImage, uploadImage } = require("../../middleware/Uploads.js");
const {
  deleteLocalFile,
} = require("../../middleware/DeleteImageFromLoaclFolder.js");
const { default: mongoose } = require("mongoose");

// exports.createSubProduct = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const { name, type, categoryId, subcategoryId, price } = req.body;
//     console.log("Request Body: ", req.body);

//     // Basic validation
//     if (!name || !price || !type || !subcategoryId || !categoryId) {
//       return next(new ErrorHandler("All required fields must be filled.", 400));
//     }
// const parsedTypes = Array.isArray(type) ? [type] : typeof type === "string" ? JSON.parse(type) : [type];
//     console.log("Request Body: ", parsedTypes);
//   const parsedCategoryId = Array.isArray(subcategoryId) ? subcategoryId : typeof subcategoryId === "string" ? JSON.parse(subcategoryId) : [subcategoryId];

//   const parsedMainCategoryId = Array.isArray(categoryId) ? categoryId : typeof categoryId === "string" ? JSON.parse(categoryId) : [categoryId];


//     // Upload Images
//     console.log("Product Images: ", req.files);
//     const productImages = [];
//     const files = req?.files || [];

//     for (const file of files) {
//       const uploadedImage = await uploadImage(file.path); // Cloudinary upload
//       productImages.push(uploadedImage);
//       deleteLocalFile(file.path); // Remove local temp file
//     }

//     console.log("productImages: ", productImages);
//     // Create product
//     const newProduct = await Product.create({
//       productName: name,
//       price,
//       type: parsedTypes,
//       categoryId: parsedCategoryId,
//       mainCategoryId: parsedMainCategoryId,
//       images: productImages,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Product created successfully!",
//       data: newProduct,
//     });
//   } catch (error) {
//     console.error("Product creation error:", error);

//     // Cleanup uploaded files on failure
//     if (req.files?.productImages) {
//       for (const file of req.files.productImages) {
//         deleteLocalFile(file.path);
//       }
//     }

//     return next(
//       new ErrorHandler("Failed to create product. " + error.message, 500)
//     );
//   }
// });

exports.createSubProduct = catchAsyncErrors(async (req, res, next) => {
  const { name, type, categoryId, subcategoryId, price, sku } = req.body;
  console.log("Request Body: ", req.body);
  if (!name || !price || !type || !categoryId || !subcategoryId) {
    return next(new ErrorHandler("All required fields must be filled.", 400));
  }

  // Upload Images
  const productImages = [];
  const files = req?.files || [];
  for (const file of files) {
    const uploadedImage = await uploadImage(file.path);
    productImages.push(uploadedImage);
    deleteLocalFile(file.path);
  }

  const newProduct = await Product.create({ sku, productName: name, price, type, categoryId: subcategoryId, mainCategoryId: categoryId, images: productImages, });

  res.status(201).json({ success: true, message: "Product created successfully!", data: newProduct, });
});

// exports.updateProductByID = catchAsyncErrors(async (req, res, next) => {
//   const productID = req.params.id;

//   const { name, price, type, categoryId, subcategoryId } = req.body;
//   console.log("Product Update Request: ", req?.body);

//   if (!name || !price || !type || !categoryId) {
//     return next(new ErrorHandler("All required fields must be filled.", 400));
//   }
//   const parsedTypes = Array.isArray(type) ? type : typeof type === "string" ? JSON.parse(type) : [type];

//   const parsedCategoryId = Array.isArray(subcategoryId) ? subcategoryId : typeof subcategoryId === "string" ? JSON.parse(subcategoryId) : [subcategoryId];

//   const parsedMainCategoryId = Array.isArray(categoryId) ? categoryId : typeof categoryId === "string" ? JSON.parse(categoryId) : [categoryId];

//   const existingProduct = await Product.findById(productID);
//   if (!existingProduct) {
//     return next(new ErrorHandler("Product not found!", 404));
//   }

//   const imageUrls = [];
//   const productFiles = req?.files || [];

//   if (req.files && req.files.length > 0) {
//     for (let oldImage of existingProduct.images) {
//       await deleteImage(oldImage);
//     }

//     for (let file of productFiles) {
//       const imageUrl = await uploadImage(file.path);
//       imageUrls.push(imageUrl);
//       deleteLocalFile(file.path);
//     }
//   }
//   const updatedProduct = await Product.findByIdAndUpdate(
//     productID,
//     {
//       productName: name,
//       price,
//       categoryId: parsedCategoryId,
//       mainCategoryId: parsedMainCategoryId,
//       type: parsedTypes,
//       images: imageUrls.length > 0 ? imageUrls : existingProduct.images, // Retain old images if no new ones
//     },
//     { new: true, runValidators: true }
//   );

//   // Return the updated product
//   res
//     .status(200)
//     .json({
//       success: true,
//       message: "Product Updated Successfully",
//       data: updatedProduct,
//     });
// });

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
    {
      productName: name,
      price,
      categoryId: subcategoryId,
      mainCategoryId: categoryId,
      type,
      sku,
      images: imageUrls.length > 0 ? imageUrls : existingProduct.images, // Retain old images if no new ones
    },
    { new: true, runValidators: true }
  );

  // Return the updated product
  res.status(200).json({ success: true, message: "Product Updated Successfully", data: updatedProduct, });
});

// exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const products = await Product.find({})
//       .populate("categoryId")
//       .sort({ createdAt: -1 });

//     res.status(200).json({ success: true, data: products });
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 500));
//   }
// });


// exports.getAllProductsWithPagination = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const skip = (page - 1) * limit;
//     const search = req.query.search || "";
//     let query = {};
//     console.log("BODY:=>", search)
//     if (search) {
//       query = {
//         $or: [
//           { productName: { $regex: search, $options: "i" } },
//           { sku: { $regex: search, $options: "i" } },
//           { type: { $regex: search, $options: "i" } },
//           { price: isNaN(Number(search)) ? undefined : Number(search) }, // numeric search
//           { status: search.toLowerCase() === "true" ? true : search.toLowerCase() === "false" ? false : undefined },
//           { isActive: search.toLowerCase() === "true" ? true : search.toLowerCase() === "false" ? false : undefined },
//           // For ObjectId (categoryId) search
//           { mainCategoryId: mongoose.Types.ObjectId.isValid(search) ? search : undefined },
//           { categoryId: mongoose.Types.ObjectId.isValid(search) ? search : undefined },
//         ].filter(Boolean), // remove undefined conditions
//       };
//     }

//     // Count total documents
//     const totalProducts = await Product.countDocuments(query);


//     // Get paginated data
//     const products = await Product.find(query)
//       .populate("categoryId")
//       .populate("mainCategoryId")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);
//     console.log("products==>", products);
//     res.status(200).json({
//       success: true,
//       data: products,
//       pagination: { totalProducts, totalPages: Math.ceil(totalProducts / limit), currentPage: page, limit, },
//     });
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 500));
//   }
// });

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

      // Text fields
      conditions.push({ productName: { $regex: search, $options: "i" } });
      conditions.push({ sku: { $regex: search, $options: "i" } });
      conditions.push({ type: { $regex: search, $options: "i" } });

      // Numeric (price)
      if (!isNaN(Number(search))) {
        conditions.push({ price: Number(search) });
      }

      // Boolean search (status, isActive)
      if (["true", "false"].includes(search.toLowerCase())) {
        const boolVal = search.toLowerCase() === "true";
        conditions.push({ status: boolVal });
        // conditions.push({ isActive: boolVal });
      }

      // ObjectId search (categoryId / mainCategoryId)
      if (mongoose.Types.ObjectId.isValid(search)) {
        const objId = new mongoose.Types.ObjectId(search);
        conditions.push({ mainCategoryId: objId });
        conditions.push({ categoryId: { $in: [objId] } });
      }

      if (conditions.length > 0) {
        query = { $or: conditions };
      }
    }

    // Count total products
    const totalProducts = await Product.countDocuments(query);

    // Fetch paginated products
    const products = await Product.find(query)
      .populate("categoryId")
      .populate("mainCategoryId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});


exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {

  try {
    const products = await Product.find({}).populate("categoryId").populate("mainCategoryId").sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

exports.typeProducts = catchAsyncErrors(async (req, res, next) => {
  try {
    const { type, productId } = req.body;
    const products = await Product.findByIdAndUpdate(productId, { type })
      .populate("categoryId")
      .populate("mainCategoryId")
      .sort({ createdAt: -1 });
    res.status(200).json({ massage: "Product Type Updated Successfully", success: true, data: products, });
    // sendResponse(res, 200, "Product Fetched Successfully", products);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

exports.changeStatus = catchAsyncErrors(async (req, res, next) => {
  try {
    const { productId, status } = req.body;
    const products = await Product.findByIdAndUpdate(productId, { status })
      .populate("categoryId")
      .populate("mainCategoryId")
      .sort({ createdAt: -1 });
    res.status(200).json({ massage: "Product Status Updated Successfully", success: true, data: products, });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

exports.getProductByID = catchAsyncErrors(async (req, res, next) => {
  try {
    const productID = req.params.id;
    const product = await Product.findOne({ _id: productID }).populate("categoryId").populate("mainCategoryId").sort({ createdAt: -1 });

    sendResponse(res, 200, "Product Fetched Successfully", product);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
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
    res
      .status(200)
      .json({
        message: "Product deleted successfully",
        success: true,
        data: product,
      });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

exports.changeStockStatus = catchAsyncErrors(async (req, res, next) => {
  try {
    const { productId, isActive } = req.body;
    const products = await Product.findByIdAndUpdate(productId, { isActive })
      .populate("categoryId")
      .sort({ createdAt: -1 });
    res
      .status(200)
      .json({
        massage: "Product Stock Updated Successfully",
        success: true,
        data: products,
      });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

exports.getAllProductsByType = catchAsyncErrors(async (req, res, next) => {
  const { term } = req.params;

  try {
    const products = await Product.find({ type: term })
      .populate("categoryId")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    console.error("Error fetching products by type:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products by type" });
  }
});

exports.searchProduct = catchAsyncErrors(async (req, res, next) => {
  const { term } = req.params;

  try {
    // Find matching categories by name
    const matchingCategories = await Category.find({
      name: { $regex: term, $options: "i" },
    }).select("_id");

    const matchingCategoryIds = matchingCategories.map((cat) => cat._id);

    const searchConditions = [
      { productName: { $regex: term, $options: "i" } },
      { type: { $regex: term, $options: "i" } },
    ];

    // If term is a number, search for exact price match
    if (!isNaN(Number(term))) {
      searchConditions.push({ price: Number(term) });
    }

    // If categories match, include categoryId condition
    if (matchingCategoryIds.length > 0) {
      searchConditions.push({ categoryId: { $in: matchingCategoryIds } });
    }

    const products = await Product.find({ $or: searchConditions }).populate("categoryId").populate("mainCategoryId");

    sendResponse(res, 200, "Product Fetched Successfully", { products });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

exports.getProductsByCategory = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;

    const products = await Product.find({ categoryId: id }).populate("categoryId").populate("mainCategoryId");
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
