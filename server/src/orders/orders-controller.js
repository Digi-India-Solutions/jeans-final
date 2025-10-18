const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const { Order, AdminOrder } = require("./orders-model");
const User = require("../users/users-model");
const { RewardPoints } = require("../rewordsPoints/rewordsPoints-model");
const ShortUniqueId = require("short-unique-id");
const ErrorHandler = require("../../utils/ErrorHandler");
const Cart = require("../addToCard/card-model");
const crypto = require("crypto");
const razorpayInstance = require("../../utils/razorpay");
const { sendThankYouEmailAdmin, sendThankYouEmail } = require("../../utils/mail");
const { sendOrderThankByUserOnWhatsapp } = require("../../utils/whatsAppCampaigns");
const subProductsModel = require("../subProducts/subProducts-model");

exports.createOrder = catchAsyncErrors(async (req, res, next) => {
    try {
        const {
            userId,
            products,
            shippingAddress,
            paymentMethod,
            shippingCost = 0,
            discountCupan = 0,
            cupanCode = null,
            rewardPointsUsed = 0,
            paymentInfo = {},
            // orderStatus = "pending",
            paymentStatus = paymentMethod === "Online" ? "Failed" : "Pending",
            orderDate = new Date(),
            pendingAmount = 0,
            recivedAmount = 0,
            totalAmount,
        } = req.body;

        // Validate user
        const user = await User.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User not found.", 404));
        }

        // Fetch user's cart
        const cart = await Cart.findOne({ user: userId });
        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Your cart is empty." });
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

        // ✅ Calculate total from `products` array (not trusting frontend's total)
        let calculatedTotal = 0;
        // if (!Array.isArray(products) || products.length === 0) {
        //     return next(new ErrorHandler("No products provided in the order.", 400));
        // }

        cart.items.forEach((item) => {
            calculatedTotal += item.price * item.quantity;
        });

        const grandTotal = (calculatedTotal + shippingCost) - discountCupan;
        console.log("cart.items:=", grandTotal)
        // 🔐 Generate Unique Order ID and Invoice
        const uid = new ShortUniqueId({ length: 4, dictionary: "number" });
        const uniqueId = uid.rnd();
        const dateObj = new Date(orderDate);
        const formattedDate = `${String(dateObj.getMonth() + 1).padStart(2, "0")}${String(dateObj.getDate()).padStart(2, "0")}${dateObj.getFullYear()}`;
        const orderUniqueId = `OD${uniqueId}`;
        const invoiceNumber = `OGS${formattedDate}${uniqueId}`;

        // 📦 Create Order
        const newOrder = await Order.create({
            userId,
            products: cart.items,
            shippingAddress,
            paymentMethod,
            paymentInfo,
            totalAmount: totalAmount || grandTotal,
            shippingCost,
            discountCupan,
            cupanCode,
            rewardPointsUsed,
            // orderStatus,
            // paymentStatus,
            paymentStatus: paymentMethod == "Online" ? "Failed" : "Pending",
            orderDate: dateObj,
            orderUniqueId,
            invoiceNumber,
            pendingAmount,
            recivedAmount,
        });

        /////////////ADD POINTS//////////////////////////////
        let userPoints = await RewardPoints.findOne({ userId });
        if (rewardPointsUsed > 0) {
            if (!userPoints || userPoints?.points < rewardPointsUsed) {
                return res.status(400).json({ success: false, message: "Insufficient reward points." });
            }
            userPoints.points -= rewardPointsUsed;
            userPoints.history.push({ type: "redeemed", amount: rewardPointsUsed, description: `Points redeemed for Order ${orderUniqueId}`, });
            await userPoints.save();

            let userPoints2 = await RewardPoints.findOne({ userId });

            const earnedPoints = Math.floor((newOrder.totalAmount * 4) / 100);

            if (!userPoints2) {
                userPoints2 = new RewardPoints({
                    userId,
                    points: earnedPoints,
                    history: [{ type: "earned", amount: earnedPoints, description: `Points earned for Order ${orderUniqueId}`, }],
                });
            } else {
                userPoints2.points += earnedPoints;
                userPoints2.history.push({ type: "earned", amount: earnedPoints, description: `Points earned for Order ${orderUniqueId}`, });
            }
            await userPoints2.save();
        } else {
            // Earn 4% points
            const earnedPoints = Math.floor((newOrder.totalAmount * 4) / 100);

            if (!userPoints) {
                userPoints = new RewardPoints({
                    userId,
                    points: earnedPoints,
                    history: [{ type: "earned", amount: earnedPoints, description: `Points earned for Order ${orderUniqueId}`, }],
                });
            } else {
                userPoints.points += earnedPoints;
                userPoints.history.push({ type: "earned", amount: earnedPoints, description: `Points earned for Order ${orderUniqueId}`, });
            }
        }

        await userPoints.save();
        //////////////////////////////////////////////////////////////////////////////////////////////

        // 🧹 Clear Cart
        // cart.items = [];
        // cart.totalAmount = 0;
        // await cart.save();


        // ✅ Send Response
        return res.status(201).json({
            success: true,
            message: "Order created successfully.",
            order: { _id: newOrder._id, orderUniqueId, invoiceNumber, totalAmount: grandTotal, userId, pendingAmount, recivedAmount, },
        });
    } catch (error) {
        return next(new ErrorHandler(error.message || "Failed to create order.", 500));
    }
});

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, order_id, userId, rewardPointsUsed, orderUniqueId } = req.body;

        // console.log("Payment verification payload:", req.body);

        const cart = await Cart.findOne({ user: userId });


        // 1. Validate order exists
        const order = await Order.findById(order_id).populate("userId");
        if (!order) {
            return res.status(201).json({ error: "Order not found" });
        }

        // 1.a Prevent verifying the same payment twice
        if (order?.paymentStatus === "Complete Payment") {
            return res.status(200).json({ message: "Payment already verified", orderId: order?._id });
        }

        // 2. Build the expected signature
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            console.error("Missing RAZORPAY_SECRET in environment");
            return res.status(400).json({ error: "Server misconfiguration" });
        }

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        console.log("razorpay_order_id:", razorpay_order_id, "razorpay_payment_id:", razorpay_payment_id);
        console.log("expectedSignature:", expectedSignature, "razorpay_signature:", razorpay_signature);

        // 3. Safe compare (prevents timing attacks)
        const sigBuffer = Buffer.from(razorpay_signature, "hex");
        const expBuffer = Buffer.from(expectedSignature, "hex");

        const signaturesMatch = sigBuffer.length === expBuffer.length && crypto.timingSafeEqual(sigBuffer, expBuffer);

        if (!signaturesMatch) {
            console.warn("Signature verification failed");
            return res.status(400).json({ error: "Payment verification failed" });
        }

        // 4. Update order on success
        order.paymentStatus = order.pendingAmount === 0 ? "Complete Payment" : "Partial Payment";
        order.paymentInfo = { transactionId: razorpay_payment_id, orderId: razorpay_order_id, paymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, };
        order.recivedAmount = order.recivedAmount;
        order.pendingAmount = order.pendingAmount || 0;

        const earnedPoints = Math.floor((order.totalAmount * 4) / 100);
        order.reworPoins = earnedPoints || 0;
        await order.save();

        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();

        // /////////////ADD POINTS//////////////////////////////
        // let userPoints = await RewardPoints.findOne({ userId });
        // if (rewardPointsUsed > 0) {
        //     if (!userPoints || userPoints?.points < rewardPointsUsed) {
        //         return res.status(400).json({ success: false, message: "Insufficient reward points." });
        //     }
        //     userPoints.points -= rewardPointsUsed;
        //     userPoints.history.push({ type: "redeemed", amount: rewardPointsUsed, description: `Points redeemed for Order ${orderUniqueId}`, });
        //     await userPoints.save();

        //     let userPoints2 = await RewardPoints.findOne({ userId });

        //     const earnedPoints = Math.floor((order.totalAmount * 4) / 100);

        //     if (!userPoints2) {
        //         userPoints2 = new RewardPoints({
        //             userId,
        //             points: earnedPoints,
        //             history: [{ type: "earned", amount: earnedPoints, description: `Points earned for Order ${orderUniqueId}`, }],
        //         });
        //     } else {
        //         userPoints2.points += earnedPoints;
        //         userPoints2.history.push({ type: "earned", amount: earnedPoints, description: `Points earned for Order ${orderUniqueId}`, });
        //     }
        //     await userPoints2.save();
        // } else {
        //     // Earn 4% points
        //     const earnedPoints = Math.floor((order.totalAmount * 4) / 100);

        //     if (!userPoints) {
        //         userPoints = new RewardPoints({
        //             userId,
        //             points: earnedPoints,
        //             history: [{ type: "earned", amount: earnedPoints, description: `Points earned for Order ${orderUniqueId}`, }],
        //         });
        //     } else {
        //         userPoints.points += earnedPoints;
        //         userPoints.history.push({ type: "earned", amount: earnedPoints, description: `Points earned for Order ${orderUniqueId}`, });
        //     }
        // }

        // await userPoints.save();
        // //////////////////////////////////////////////////////////////////////////////////////////////

        sendThankYouEmail({ email: order?.userId?.email, name: order?.userId?.name, phone: order?.userId?.phone });
        sendThankYouEmailAdmin({ email: order?.userId?.email, name: order?.userId?.name, phone: order?.userId?.phone });
        sendOrderThankByUserOnWhatsapp({ name: order?.userId?.name, mobile: order?.userId?.phone, email: order?.userId?.email });
        return res.status(200).json({ message: "Payment verified successfully", orderId: order?._id });
    } catch (error) {
        console.error("Error verifying Razorpay payment:", error);
        return res.status(500).json({ error: "Server error while verifying payment" });
    }
}

const generateOrderNumber = async () => {

    const totalOrders = await AdminOrder.countDocuments();


    const dateObj = new Date();
    const year = dateObj.getFullYear();

    // Format serial number with leading zeros (4 digits)
    const formattedSerial = String(totalOrders + 1).padStart(5, "0");

    // Create order number like ORD-2025-0001
    const orderNumber = `ORD-${year}-${formattedSerial}`;
    console.log('totalOrders', orderNumber)
    return orderNumber

};

exports.createOrderByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const {
            customer,
            items,
            subtotal,
            pointsRedeemed = 0,
            pointsRedemptionValue = 0,
            total,
            status = "Pending",
            paymentType,
            paidAmount = 0,
            balanceAmount = 0,
            payments = [],
            paymentMethod,
            orderType = "Offline",
            orderDate = new Date().toISOString().split("T")[0], // YYYY-MM-DD
            trackingId = "",
            deliveryVendor = "",
            pointsEarned = 0,
            pointsEarnedValue = 0,
            orderNote,
            transportName,
        } = req.body;

        // ✅ Validate required fields
        if (!customer?.name || !customer?.deliveryAddress || !Array.isArray(items) || items.length === 0) {
            return next(new ErrorHandler("Customer info and at least 1 item are required.", 400));
        }
        // ✅ Generate unique order number
        const orderNumber = await generateOrderNumber();

        // ✅ Create status history
        const statusHistory = [
            { status, date: orderDate, updatedBy: "System" },
        ];
        console.log("FFFFFFFF:==>hjh", req.body, orderNumber)

        // /////////////ADD POINTS//////////////////////////////
        let userPoints = await RewardPoints.findOne({ userId: customer?.userId });
        if (pointsRedeemed > 0) {
            if (!userPoints || userPoints?.points < pointsRedeemed) {
                return res.status(400).json({ success: false, message: "Insufficient reward points." });
            }
            userPoints.points -= pointsRedeemed;
            userPoints.history.push({ type: "redeemed", amount: pointsRedeemed, description: `Points redeemed for Order ${orderNumber}`, });
            await userPoints.save();

            let userPoints2 = await RewardPoints.findOne({ userId: customer?.userId });

            let earnedPoints = Math.floor((total * 4) / 100);
            earnedPoints = earnedPoints > 5000 ? 5000 : earnedPoints

            if (!userPoints2) {
                userPoints2 = new RewardPoints({
                    userId: customer?.userId,
                    points: earnedPoints,
                    history: [{ type: "earned", amount: earnedPoints, description: `Points earned for Order ${orderNumber}`, }],
                });
            } else {
                userPoints2.points += earnedPoints;
                userPoints2.history.push({ type: "earned", amount: earnedPoints, description: `Points earned for Order ${orderNumber}`, });
            }
            await userPoints2.save();
        } else {
            // Earn 4% points
            let earnedPoints = Math.floor((total * 4) / 100);
            earnedPoints = earnedPoints > 5000 ? 5000 : earnedPoints
            if (!userPoints) {
                userPoints = new RewardPoints({
                    userId: customer?.userId,
                    points: earnedPoints,
                    history: [{ type: "earned", amount: earnedPoints, description: `Points earned for Order ${orderNumber}`, }],
                });
            } else {
                userPoints.points += earnedPoints;
                userPoints.history.push({ type: "earned", amount: earnedPoints, description: `Points earned for Order ${orderNumber}`, });
            }
        }

        await userPoints.save();
        // //////////////////////////////////////////////////////////////////////////////////////////////

        let pointsEarneds = pointsEarned > 5000 ? 5000 : pointsEarned
        let pointsEarnedValues = pointsEarneds / 2

        // ✅ Create new order
        const newOrder = await AdminOrder.create({
            orderNumber, customer, items, subtotal, pointsRedeemed, pointsRedemptionValue, total,
            status, paymentType, paidAmount, balanceAmount, payments, paymentMethod, orderType,
            orderDate, trackingId, deliveryVendor, pointsEarned: pointsEarneds, pointsEarnedValue: pointsEarnedValues, statusHistory,
            transportName, orderNote
        });
        if (newOrder) {
            for (const item of items) {
                const product = await subProductsModel?.findById(item.productId);

                if (product) {
                    // ensure both are numbers
                    const currentStock = Number(product.lotStock) || 0;
                    const quantityOrdered = Number(item.quantity) || 0;

                    // update stock
                    product.lotStock = currentStock - quantityOrdered;

                    // if stock depleted
                    if (product.lotStock <= 0) {
                        product.lotStock = 0; // avoid negative stock
                        product.stock = 'Out of Stock';
                    }

                    await product.save();
                }
            }
        }

        res.status(201).json({ success: true, message: "Order created successfully.", order: newOrder, });
    } catch (err) {
        return next(new ErrorHandler(err.message || "Failed to create order.", 500));
    }
});

exports.createOrderByclient = catchAsyncErrors(async (req, res, next) => {
    try {
        const {
            customer,
            items,
            subtotal,
            pointsRedeemed = 0,
            pointsRedemptionValue = 0,
            total,
            status = "Pending",
            paymentType,
            paidAmount = 0,
            balanceAmount = 0,
            payments = [],
            paymentMethod,
            orderType = "Offline",
            orderDate = new Date().toISOString().split("T")[0], // YYYY-MM-DD
            trackingId = "",
            deliveryVendor = "",
            pointsEarned = 0,
            pointsEarnedValue = 0,
            orderNote,
            transportName,
        } = req.body;

        // ✅ Validate required fields
        if (!customer?.name || !customer?.deliveryAddress || !Array.isArray(items) || items.length === 0) {
            return next(new ErrorHandler("Customer info and at least 1 item are required.", 400));
        }
        // ✅ Generate unique order number
        const orderNumber = generateOrderNumber();

        // ✅ Create status history
        const statusHistory = [
            { status, date: orderDate, updatedBy: "System" },
        ];
        console.log("FFFFFFFF:==>", req.body)

        // /////////////ADD POINTS//////////////////////////////
        let userPoints = await RewardPoints.findOne({ userId: customer?.userId });
        if (pointsRedeemed > 0) {
            if (!userPoints || userPoints?.points < pointsRedeemed) {
                return res.status(400).json({ success: false, message: "Insufficient reward points." });
            }
            userPoints.points -= pointsRedeemed;
            userPoints.history.push({ type: "redeemed", amount: pointsRedeemed, description: `Points redeemed for Order ${orderNumber}`, });
            await userPoints.save();

            let userPoints2 = await RewardPoints.findOne({ userId: customer?.userId });

            let earnedPoints = Math.floor((total * 4) / 100);
            earnedPoints = earnedPoints > 5000 ? 5000 : earnedPoints

            if (!userPoints2) {
                userPoints2 = new RewardPoints({
                    userId: customer?.userId,
                    points: earnedPoints,
                    history: [{ type: "earned", amount: earnedPoints, description: `Points earned for Order ${orderNumber}`, }],
                });
            } else {
                userPoints2.points += earnedPoints;
                userPoints2.history.push({ type: "earned", amount: earnedPoints, description: `Points earned for Order ${orderNumber}`, });
            }
            await userPoints2.save();
        } else {
            // Earn 4% points
            let earnedPoints = Math.floor((total * 4) / 100);
            earnedPoints = earnedPoints > 5000 ? 5000 : earnedPoints
            if (!userPoints) {
                userPoints = new RewardPoints({
                    userId: customer?.userId,
                    points: earnedPoints,
                    history: [{ type: "earned", amount: earnedPoints, description: `Points earned for Order ${orderNumber}`, }],
                });
            } else {
                userPoints.points += earnedPoints;
                userPoints.history.push({ type: "earned", amount: earnedPoints, description: `Points earned for Order ${orderNumber}`, });
            }
        }

        await userPoints.save();
        // //////////////////////////////////////////////////////////////////////////////////////////////

        let pointsEarneds = pointsEarned > 5000 ? 5000 : pointsEarned
        let pointsEarnedValues = pointsEarneds / 2

        // ✅ Create new order
        const newOrder = await AdminOrder.create({
            orderNumber, customer, items, subtotal, pointsRedeemed, pointsRedemptionValue, total,
            status, paymentType, paidAmount, balanceAmount, payments, paymentMethod, orderType,
            orderDate, trackingId, deliveryVendor, pointsEarned: pointsEarneds, pointsEarnedValue: pointsEarnedValues, statusHistory,
            transportName, orderNote
        });

        if (newOrder) {
            for (const item of items) {
                const product = await subProductsModel?.findById(item.productId);

                if (product) {
                    // ensure both are numbers
                    const currentStock = Number(product.lotStock) || 0;
                    const quantityOrdered = Number(item.quantity) || 0;

                    // update stock
                    product.lotStock = currentStock - quantityOrdered;

                    // if stock depleted
                    if (product.lotStock <= 0) {
                        product.lotStock = 0; // avoid negative stock
                        product.stock = 'Out of Stock';
                    }

                    await product.save();
                }
            }
        }


        res.status(201).json({ success: true, message: "Order created successfully.", order: newOrder, });
    } catch (error) {
        return next(new ErrorHandler(error.message || "Failed to create order.", 500));
    }
});

exports.verifyPaymentByClient = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            order_id,
        } = req.body;

        const order = await AdminOrder.findById({ _id: order_id }).populate("customer.userId");

        if (!order) return res.status(404).json({ error: "Order not found" });

        if (order.paymentMethod === "RAZORPAY") {
            return res.status(200).json({ message: "Payment already verified", orderId: order?._id });
        }

        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const secret = process.env.RAZORPAY_KEY_SECRET;

        if (!secret) return res.status(500).json({ error: "Missing Razorpay secret" });

        const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

        const isValid = expectedSignature === razorpay_signature;

        if (!isValid) {
            return res.status(400).json({ error: "Invalid Razorpay signature" });
        }

        // ✅ Update order with payment info
        order.paymentMethod = "RAZORPAY";
        order.paymentInfo = {
            transactionId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
        };
        order.paymentType = order.balanceAmount === 0 ? "Complete Payment" : "Partial Payment";

        await order.save();

        // ✅ Notify
        sendThankYouEmail({
            email: order?.customer?.userId?.email,
            name: order?.customer?.userId?.name,
            phone: order?.customer?.userId?.phone
        });

        sendThankYouEmailAdmin({
            email: order?.customer?.userId?.email,
            name: order?.customer?.userId?.name,
            phone: order?.customer?.userId?.phone
        });

        sendOrderThankByUserOnWhatsapp({
            name: order?.customer?.userId?.name,
            mobile: order?.customer?.userId?.phone,
            email: order?.customer?.userId?.email
        });

        return res.status(200).json({ message: "Payment verified successfully", orderId: order._id });

    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({ error: "Server error during Razorpay verification" });
    }
};

exports.getAllOrdersByAdminWithPagination = catchAsyncErrors(async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const search = req.query.search?.trim() || "";

        const skip = (page - 1) * limit;

        // ✅ Search conditions
        let query = {};
        if (search) {
            query = {
                $or: [
                    { "customer.name": { $regex: search, $options: "i" } },
                    { "customer.email": { $regex: search, $options: "i" } },
                    { "customer.phone": { $regex: search, $options: "i" } },
                    { orderNumber: { $regex: search, $options: "i" } },
                    { paymentMethod: { $regex: search, $options: "i" } },
                    { status: { $regex: search, $options: "i" } },
                ],
            };
        }

        // ✅ Fetch orders
        const [orders, totalOrders] = await Promise.all([
            AdminOrder.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("items.productId").populate("items.productId.productId").populate("customer.userId"),
            AdminOrder.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            orders,
            pagination: {
                totalOrders,
                currentPage: page,
                totalPages: Math.ceil(totalOrders / limit),
                limit,
            },
        });
    } catch (err) {
        return next(new ErrorHandler(err.message || "Failed to fetch orders.", 500));
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


exports.getAllAdminOrders = catchAsyncErrors(async (req, res, next) => {
    try {
        const totalOrders = await AdminOrder.countDocuments();

        const orders = await AdminOrder.find({}).sort({ createdAt: -1 }).populate("items.productId").populate("items.productId.productId").populate("customer.userId")

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
                populate: [
                    { path: "productId" },
                    { path: "sizes" }
                ]
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
        if (paymentStatus === 'Complete Payment') {
            order.orderStatus = 'delivered';
            order.recivedAmount = order.totalAmount;
            order.pendingAmount = 0;
        }
        await order.save();

        res.status(200).json({ success: true, message: "status updated successfully", updatedOrder: order, });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Something went wrong while updating order", error: error.message, });
    }
});

exports.changeStatusByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { newStatus, trackingId = "", deliveryVendor = "" } = req.body;

        if (!newStatus) {
            return next(new ErrorHandler("New status is required.", 400));
        }

        const order = await AdminOrder.findById(orderId);
        if (!order) {
            return next(new ErrorHandler("Order not found.", 404));
        }

        // ✅ Update status
        order.status = newStatus;

        // ✅ Push into history
        order.statusHistory.push({
            status: newStatus,
            date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
            updatedBy: "Admin",
        });

        // ✅ If shipped, add tracking details
        if (newStatus === "Shipped") {
            order.trackingId = trackingId;
            order.deliveryVendor = deliveryVendor;
        }

        // if (newStatus === 'Delivered') {
        //     order.items.forEach(item => {
        //         item.deliveredPcs = (Number(item.quantity) * Number(item.pcsInSet)) || 0;
        //     });
        // }


        await order.save();

        res.status(200).json({ success: true, message: `Order status updated to ${newStatus}.`, order, });
    } catch (err) {
        return next(new ErrorHandler(err.message || "Failed to update order status.", 500));
    }
});

exports.updateOrderPaymentByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { additionalPayment, paymentMethod, notes = "" } = req.body;

        if (!additionalPayment || additionalPayment <= 0) {
            return next(new ErrorHandler("Additional payment must be greater than 0.", 400));
        }

        const order = await AdminOrder.findById(orderId);
        if (!order) {
            return next(new ErrorHandler("Order not found.", 404));
        }

        // ✅ Update paid & balance amounts
        const newPaidAmount = order.paidAmount + additionalPayment;
        const newBalanceAmount = Math.max(0, order.total - newPaidAmount);

        // ✅ Push into payments history
        order.payments.push({
            amount: additionalPayment,
            method: paymentMethod || order.paymentMethod || "Unknown",
            notes,
            date: new Date(),
        });

        order.paidAmount = newPaidAmount;
        order.balanceAmount = newBalanceAmount;
        order.paymentType = newBalanceAmount === 0 ? "Complete Payment" : "Partial Payment";
        order.paymentMethod = paymentMethod || order.paymentMethod;

        await order.save();

        res.status(200).json({
            success: true,
            message: "Payment updated successfully.",
            order,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message || "Failed to update payment.", 500));
    }
});

exports.updateOrderNoteByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { orderNote } = req.body;
        // console.log("DDDDDD:==>", orderNote)
        // 🔹 Validate input
        if (!orderNote || orderNote.trim().length < 3) {
            return next(
                new ErrorHandler("Order note must be at least 3 characters long.", 400)
            );
        }

        // 🔹 Find the order
        const order = await AdminOrder.findById(orderId);
        if (!order) {
            return next(new ErrorHandler("Order not found.", 404));
        }

        // 🔹 Update note
        order.orderNote = orderNote.trim();
        await order.save();

        res.status(200).json({ success: true, message: "Order note updated successfully.", order, });

    } catch (err) {
        return next(
            new ErrorHandler(err.message || "Failed to update order note.", 500)
        );
    }
});

exports.getAllOrdersByUser = catchAsyncErrors(async (req, res, next) => {
    try {
        // const { pageNumber } = req.query;
        const userID = req.params.id;
        console.log("orders=>", userID)
        const orders = await AdminOrder.find({ "customer.userId": userID }).sort({ createdAt: -1 }).populate({
            path: "items.productId",
            populate: [
                { path: "productId" },
                // { path: "sizes" }
            ]
        }).populate("customer.userId", "name email , phone")
        console.log("orders=>", orders)
        // .populate("products.subProduct");
        // console.log("orders:==>", !orders[0].products.length);
        if (!orders || orders?.length === 0) {
            return res.status(201).json({ success: false, message: "Your Orders is empty" });
        }
        else if (orders[0]?.items?.length <= 0) {
            return res.status(201).json({ success: false, message: "You have no Orders" });
        }
        res.status(200).json({ success: true, message: "Orders Fetched Successfully", orders, });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.deleteOrderByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const orderID = req.params.id;
        console.log("orderID:=>", orderID);
        const orderData = await Order.findByIdAndDelete(orderID);

        if (!orderData) {
            return res.status(204).json({ status: false, message: "Order not found" });
            // return next(new ErrorHandler("Order not found!", 400));
        }
        return res.status(200).json({ status: true, message: "Payment verified successfully", data: orderData });
        // sendResponse(res, 200, "Order deleted successfully", orderData);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.FilterOrdersByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        console.log("GGGG:==>", req.body)
        const { status, orderType, customerType, paymentType, search } = req.body;

        const query = {};

        // 🔹 Status filter
        if (status) {
            query.status = status;
        }

        // 🔹 Order type filter
        if (orderType) {
            query.orderType = orderType;
        }

        // 🔹 Customer type filter (if exists in schema)
        if (customerType) {
            query["customer.type"] = customerType;
        }

        // 🔹 Payment type filter
        if (paymentType) {
            query.paymentType = paymentType;
        }

        // 🔹 Search filter
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: "i" } },
                { "customer.name": { $regex: search, $options: "i" } },
                { "customer.email": { $regex: search, $options: "i" } },
                { "customer.phone": { $regex: search, $options: "i" } }
            ];
        }

        // Count total orders
        const totalOrders = await AdminOrder.countDocuments(query);

        // Fetch paginated orders
        const orders = await AdminOrder.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate("customer.userId", "name email uniqueUserId")
            .populate("items.productId", "name price images uniqueProductId");

        res.status(200).json({
            success: true,
            orders,
            pagination: {
                totalOrders,
                currentPage: page,
                totalPages: Math.ceil(totalOrders / limit),
                limit,
            },
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




