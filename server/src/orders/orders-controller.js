const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const Order = require("./orders-model");
const User = require("../users/users-model");
const RewardPoints = require("../rewordsPoints/rewordsPoints-model");
const ShortUniqueId = require("short-unique-id");
const ErrorHandler = require("../../utils/ErrorHandler");
const Cart = require("../addToCard/card-model");

exports.createOrder = catchAsyncErrors(async (req, res, next) => {
    try {
        const {
            userId,
            products,
            shippingAddress,
            paymentMethod,
            totalAmount,
            shippingCost,
            discountCupan,
            cupanCode = null,
            rewardPointsUsed,
            paymentInfo = {},
            orderStatus = "Pending",
            paymentStatus = "Successfull",
            orderDate = new Date(),
        } = req.body;

        // Validate products
        // if (!Array.isArray(products) || products.length === 0) {
        //     return next(new ErrorHandler('No products provided in the order.', 400));
        // }

        // Validate user
        const cart = await Cart.findOne({ user: userId });

        const user = await User.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User not found.", 404));
        }
        if (!cart.items || cart.items.length === 0) {
            return res.status(400).json({
                message: "Your Cart is empty",
                success: false
            });
        }
        // Update user's address and phone
        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    phone: shippingAddress.phone,
                    address: {
                        street: shippingAddress.address,
                        city: shippingAddress.city,
                        state: shippingAddress.state,
                        country: shippingAddress.country,
                        zipCode: shippingAddress.postalCode,
                    },
                },
            }
        );

        // Generate Order Unique ID and Invoice Number
        const uid = new ShortUniqueId({ length: 4, dictionary: "number" });
        const uniqueId = uid.rnd();
        const dateObj = new Date(orderDate);
        const formattedDate = `${String(dateObj.getMonth() + 1).padStart(
            2,
            "0"
        )}${String(dateObj.getDate()).padStart(2, "0")}${dateObj.getFullYear()}`;

        const orderUniqueId = `OD${uniqueId}`;
        const invoiceNumber = `OGS${formattedDate}${uniqueId}`;

        // Create new Order
        const order = await Order.create({
            userId, products: cart.items, shippingAddress, paymentMethod,
            paymentInfo, totalAmount, shippingCost, discountCupan, cupanCode, rewardPointsUsed,
            orderStatus, paymentStatus, orderDate: dateObj, orderUniqueId, invoiceNumber,
        });
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
        // Handle Reward Points Logic
        let userPoints = await RewardPoints.findOne({ userId });
        if (order) {
            if (rewardPointsUsed > 0) {
                // Deducting reward points
                if (!userPoints || userPoints.points < rewardPointsUsed) {
                    return res.status(400).json({ success: false, message: "Insufficient reward points." });
                }

                userPoints.points -= rewardPointsUsed;
                userPoints.history.push({
                    type: "redeemed",
                    amount: rewardPointsUsed,
                    description: `Points redeemed for Order ${orderUniqueId}`,
                });
            } else {
                // Earn reward points if not used
                const earnedPoints = Math.floor((totalAmount * 5) / 100); // 5% of total
                if (!userPoints) {
                    userPoints = new RewardPoints({
                        userId,
                        points: earnedPoints,
                        history: [
                            {
                                type: "earned",
                                amount: earnedPoints,
                                description: `Points earned for Order ${orderUniqueId}`,
                            },
                        ],
                    });
                } else {
                    userPoints.points += earnedPoints;
                    userPoints.history.push({
                        type: "earned",
                        amount: earnedPoints,
                        description: `Points earned for Order ${orderUniqueId}`,
                    });
                }
            }
            await userPoints.save();
            // Final response
            res.status(201).json({ success: true, message: "Order created successfully.", order: { _id: order._id, orderUniqueId, invoiceNumber }, });
        }
    } catch (error) {
        return next(
            new ErrorHandler(error.message || "Failed to create order.", 500)
        );
    }
});

exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    try {
        const totalOrders = await Order.countDocuments();

        const orders = await Order.find({})
            .sort({ createdAt: -1 })
            .populate("products.subProduct")
            .populate("userId", "name email , phone");
        res.status(200).json({ success: true, message: "Orders Fetched Successfully", totalOrders, orders, });
        // sendResponse(res, 200, "Order Fetched Successfully", { totalOrders, orders });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getOrderByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const orderID = req.params.id;

        const order = await Order.findById(orderID)
        .populate({
            path: "products.subProduct",
            populate: {
              path: "productId",
            }
          })
            .populate("userId", "name email , phone");
        console.log(order);
        res.status(200).json({ success: true, message: "Order Fetched Successfully", order });
        // sendResponse(res, 200, "Order Fetched Successfully", order);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.changeStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const { orderStatus, paymentStatus } = req.body;
        console.log("XXXXXXXXX", req.body);

        if (!orderId) {
            return res.status(200).json({ success: false, message: "Order ID is required" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (orderStatus) order.orderStatus = orderStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        await order.save();

        res.status(200).json({ success: true, message: "status updated successfully", updatedOrder: order, });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Something went wrong while updating order", error: error.message, });
    }
});

exports.getAllOrdersByUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const { pageNumber } = req.query;
        const userID = req.params.id;

        const totalOrders = await Order.countDocuments({ userId: userID });

        const orders = await Order.find({ userId: userID })
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * 15)
            .limit(15)
            .populate("userId", "name email")
            .populate("subProduct", )
           

        sendResponse(res, 200, "Orders Fetched Successfully", {
            totalOrders,
            totalPages: Math.ceil(totalOrders / 15),
            currentPage: parseInt(pageNumber, 10),
            orders
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
// exports.updateOrderByID = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const orderID = req.params.id;

//         const orderData = await Order.findByIdAndUpdate(orderID, req.body, {
//             new: true,
//             runValidators: true
//         });

//         if (!orderData) {
//             return next(new ErrorHandler("Order not found!", 400));
//         }

//         sendResponse(res, 200, "Order Data Fetched Successfully", orderData);
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// })

// exports.deleteOrderByID = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const orderID = req.params.id;

//         const orderData = await Order.findByIdAndDelete(orderID);

//         if (!orderData) {
//             return next(new ErrorHandler("Order not found!", 400));
//         }

//         sendResponse(res, 200, "Order deleted successfully", orderData);

//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// })



//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// })

// exports.searchOrders = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { pageNumber = 1 } = req.query;

//         const { term } = req.params;

//         const productId = await Product.find({ name: { $regex: term, $options: "i" } }).select("_id");

//         const userId = await User.find({ name: { $regex: term, $options: "i" } }).select("_id");

//         const query = {
//             $or: [
//                 { name: { $regex: term, $options: "i" } },
//                 // { ...(!isNaN(term) && { amount: term }) },
//                 { productId: productId },
//                 { userId: userId },
//             ]
//         };

//         const totalOrders = await Order.countDocuments(query);

//         const orders = await Order.find(query)
//             .sort({ createdAt: -1 })
//             .skip((pageNumber - 1) * 15)
//             .limit(15)
//             .populate("userId", "name email uniqueUserId")
//             .populate("accessoryId", "titel description price images")
//             .populate("productId", "name price uniqueProductId")

//         sendResponse(res, 200, "Orders Fetched Successfully", {
//             totalOrders,
//             totalPages: Math.ceil(totalOrders / 15),
//             currentPage: parseInt(pageNumber, 10),
//             orders
//         });

//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// });

// // exports.getAllSales = catchAsyncErrors(async (req, res, next) => {
// //     try {
// //         const { pageNumber } = req.query;

// //         const totalSales = await Order.countDocuments();

// //         const sales = await Order.find({})
// //             .sort({ createdAt: -1 })
// //             .skip((pageNumber - 1) * 15)
// //             .limit(15)
// //             .populate("userId", "name email uniqueUserId")
// //             .populate("productId", "name price uniqueProductId")
// //             .populate("accessoryId", "titel description price images")

// //         sendResponse(res, 200, "Sales Fetched Successfully", {
// //             totalSales,
// //             totalPages: Math.ceil(totalSales / 15),
// //             currentPage: parseInt(pageNumber, 10),
// //             sales
// //         });

// //     } catch (error) {
// //         return next(new ErrorHandler(error.message, 500));
// //     }
// // })

// // exports.getAllSalesByDate = catchAsyncErrors(async (req, res, next) => {
// //     try {
// //         const { from, to } = req.body;

// //         const fromDate = new Date(from);
// //         const toDate = new Date(to);
// //         toDate.setHours(23, 59, 59, 999);

// //         const usertransaction = await Order.find({
// //             createdAt: {
// //                 $gte: fromDate,
// //                 $lte: toDate
// //             }
// //         })
// //             .populate({ path: 'userId', select: 'name email address phone' })
// //             .populate("productId", "name price uniqueProductId")
// //             .populate("accessoryId", "titel description price images")
// //             .sort({ createdAt: -1 })

// //         const totalSales = usertransaction.reduce((acc, transaction) => acc + transaction.amount, 0);

// //         sendResponse(res, 200, 'users Transactions fetched successfully.', {
// //             totalSales,
// //             salesRecords: usertransaction,
// //             fromDate: fromDate,
// //             toDate: toDate,
// //         });

// //     } catch (error) {
// //         return next(new ErrorHandler(error.message, 500));
// //     }
// // });

// exports.getTotalEcommerceSales = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const result = await Order.aggregate([
//             {
//                 $group: {
//                     _id: null,
//                     totalSales: { $sum: "$amount" },
//                 }
//             }
//         ]);

//         const totalSales = result.length > 0 ? result[0].totalSales : 0;

//         sendResponse(res, 200, "Total Ecommerce Sales Fetched Successfully", totalSales);

//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }

// });

// exports.getAdminDashboardStaticsByDate = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { from, to } = req.body;

//         const fromDate = new Date(from);
//         const toDate = new Date(to);
//         toDate.setHours(23, 59, 59, 999);

//         const ecommerceSales = await Order.find({
//             createdAt: {
//                 $gte: fromDate,
//                 $lte: toDate
//             }
//         })

//         const totalEcommerceSales = ecommerceSales.reduce((acc, transaction) => acc + transaction.amount, 0);

//         const rentalSales = await Invoice.find({
//             createdAt: {
//                 $gte: fromDate,
//                 $lte: toDate
//             }
//         });

//         const totalRentalSale = rentalSales.reduce((acc, transaction) => acc + transaction.paymentAmount, 0);

//         const gpsRequests = await Request.find({
//             createdAt: {
//                 $gte: fromDate,
//                 $lte: toDate
//             }
//         })
//             .populate("clientId", "companyName uniqueClientId email contactNo address");

//         const uninstall = await Uninstall.find({
//             createdAt: {
//                 $gte: fromDate,
//                 $lte: toDate
//             }
//         })
//             .populate("clientId", "companyName uniqueClientId email contactNo address");

//         const returns = await Return.find({
//             createdAt: {
//                 $gte: fromDate,
//                 $lte: toDate
//             }
//         })
//             .populate("clientId", "companyName uniqueClientId email contactNo address");

//         const claims = await Claim.find({
//             createdAt: {
//                 $gte: fromDate,
//                 $lte: toDate
//             }
//         })
//             .populate("clientId", "companyName uniqueClientId email contactNo address");

//         sendResponse(res, 200, "Dashboard Statics Fetched Successfully", {
//             totalEcommerceSales,
//             totalRentalSale,
//             gpsRequests,
//             uninstall,
//             returns,
//             claims
//         });

//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// });

// exports.getClientDashboardStaticsByDate = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { from, to } = req.body;

//         const fromDate = new Date(from);
//         const toDate = new Date(to);
//         toDate.setHours(23, 59, 59, 999);

//         const gpsRequests = await Request.find({
//             createdAt: {
//                 $gte: fromDate,
//                 $lte: toDate
//             },
//             clientId: req?.user?._id
//         })
//             .populate("clientId", "companyName uniqueClientId email contactNo address");

//         const uninstall = await Uninstall.find({
//             createdAt: {
//                 $gte: fromDate,
//                 $lte: toDate
//             },
//             clientId: req?.user?._id

//         })
//             .populate("clientId", "companyName uniqueClientId email contactNo address");

//         const returns = await Return.find({
//             createdAt: {
//                 $gte: fromDate,
//                 $lte: toDate
//             },
//             clientId: req?.user?._id

//         })
//             .populate("clientId", "companyName uniqueClientId email contactNo address");

//         const claims = await Claim.find({
//             createdAt: {
//                 $gte: fromDate,
//                 $lte: toDate
//             },
//             clientId: req?.user?._id

//         })
//             .populate("clientId", "companyName uniqueClientId email contactNo address");

//         const inventory = await Inventory.find({
//             createdAt: {
//                 $gte: fromDate,
//                 $lte: toDate
//             },
//             clientId: req?.user?._id
//         })

//         sendResponse(res, 200, "Dashboard Statics Fetched Successfully", {
//             gpsRequests,
//             uninstall,
//             returns,
//             claims,
//             inventory
//         });

//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// });

// exports.getMyBookings = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { pageNumber } = req.query;

//         const totalBookings = await Order.countDocuments({ userId: req.user._id });

//         const bookings = await Order.find({ userId: req.user._id })
//             .sort({ createdAt: -1 })
//             .skip((pageNumber - 1) * 15)
//             .limit(15)
//             .populate("accessoryId", "titel description price images")
//             .populate("productId", "name price uniqueProductId");

//         sendResponse(res, 200, "Bookings Fetched Successfully", {
//             totalBookings,
//             totalPages: Math.ceil(totalBookings / 15),
//             currentPage: parseInt(pageNumber, 10),
//             bookings
//         });
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//     }
// })
