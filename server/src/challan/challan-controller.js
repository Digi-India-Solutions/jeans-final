const Challan = require("./challan-model"); // path to your model
const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const { AdminOrder } = require("../orders/orders-model");
const { uploadImage, deleteImage } = require("../../middleware/Uploads");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder");

// 📝 CREATE a Challan
exports.createChallan = catchAsyncErrors(async (req, res, next) => {

    const year = new Date().getFullYear();

    // Get the latest challan of this year
    const lastChallan = await Challan.findOne({ challanNumber: { $regex: `^CHN-${year}` } }).sort({ createdAt: -1 }).lean();

    let serial = 1;

    if (lastChallan && lastChallan.challanNumber) {
        const parts = lastChallan.challanNumber.split("-");
        const lastSerial = parseInt(parts[2], 10);
        serial = lastSerial + 1;
    }

    const challanNumber = `CHN-${year}-${serial.toString().padStart(3, "0")}`;

    const ExistOrder = await AdminOrder.findOne({ _id: req.body.orderId });

    if (!ExistOrder) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (Array.isArray(req.body.items)) {
        req.body.items.forEach(bodyItem => {
            // find the matching item in the order by name or productId
            const orderItem = ExistOrder.items.find(
                i => i.name === bodyItem.name // or i.productId.equals(bodyItem.productId)
            );

            if (orderItem) {
                // update dispatchedQty and anything else you want
                // console.log("bodyItem.dispatchedQty:==>", bodyItem.dispatchedQty)
                // console.log("bodyItem.alreadyDispatched:==>", bodyItem.alreadyDispatched, req.body.items)

                orderItem.dispatchedQty = (Number(bodyItem.dispatchedQty) + Number(bodyItem.alreadyDispatched || 0)) || orderItem.dispatchedQty;
                orderItem.deliveredPcs = (orderItem.dispatchedQty * orderItem.pcsInSet)
                // optionally update deliveredPcs, etc.
                // orderItem.deliveredPcs = (orderItem.quantity * orderItem.pcsInSet)
            }
        });

        // tell mongoose that the items array has been modified
        ExistOrder.markModified('items');
    }
    // console.log("ExistOrder:==>", ExistOrder.status)
    ExistOrder.status = 'Shipped';
    ExistOrder.statusHistory.push({
        status: 'Shipped',
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        updatedBy: "Admin",
    });

    ExistOrder.trackingId = req.body.notes || ExistOrder.trackingId;
    ExistOrder.deliveryVendor = req.body.vendor || ExistOrder.deliveryVendor;

    // persist changes
    await ExistOrder.save();


    console.log("ExistOrder:==>", ExistOrder)
    console.log("BODY:==>", req.body)

    const challan = await Challan.create({ ...req.body, challanNumber });
    console.log("SSSS:==>", challan)
    res.status(201).json({ success: true, challan, });
});


// exports.createChallanWithSlip = catchAsyncErrors(async (req, res, next) => {
//     const year = new Date().getFullYear();

//     // 1. Generate next challan number
//     const lastChallan = await Challan.findOne({
//         challanNumber: { $regex: `^CHN-${year}` },
//     })
//         .sort({ createdAt: -1 })
//         .lean();

//     let serial = 1;
//     if (lastChallan && lastChallan.challanNumber) {
//         const parts = lastChallan.challanNumber.split('-');
//         const lastSerial = parseInt(parts[2], 10);
//         serial = lastSerial + 1;
//     }
//     const challanNumber = `CHN-${year}-${serial.toString().padStart(3, '0')}`;

//     // 2. Update existing AdminOrder
//     const ExistOrder = await AdminOrder.findOne({ _id: req.body.orderId });
//     if (!ExistOrder) {
//         return res.status(404).json({ success: false, message: 'Order not found' });
//     }

//     if (Array.isArray(req.body.items)) {
//         req.body.items.forEach(bodyItem => {
//             const orderItem = ExistOrder.items.find(
//                 i => i.name === bodyItem.name // or use productId equals
//             );
//             if (orderItem) {
//                 orderItem.dispatchedQty =
//                     Number(bodyItem.dispatchedQty) || orderItem.dispatchedQty;
//                 orderItem.deliveredPcs = orderItem.dispatchedQty * orderItem.pcsInSet;
//             }
//         });
//         ExistOrder.markModified('items');
//     }

//     // update order status + history
//     ExistOrder.status = 'Shipped';
//     ExistOrder.statusHistory.push({
//         status: 'Shipped',
//         date: new Date().toISOString().split('T')[0],
//         updatedBy: 'Admin',
//     });

//     ExistOrder.trackingId = req.body.notes || ExistOrder.trackingId;
//     ExistOrder.deliveryVendor = req.body.vendor || ExistOrder.deliveryVendor;
//     await ExistOrder.save();

//     // 3. Upload bilti slip if present
//     let biltiSlipUrl = '';
//     if (req.file) {
//         try {
//             biltiSlipUrl = await uploadImage(req.file.path); // your util should return Cloudinary URL
//             deleteLocalFile(req.file.path);
//         } catch (err) {
//             return next(
//                 new ErrorHandler('Image upload failed, please try again', 500)
//             );
//         }
//     }

//     // 4. Create new Challan
//     const challanPayload = {
//         ...req.body,
//         challanNumber,
//         biltiSlipUrl, // store uploaded file URL
//     };

//     // if items were sent as JSON string from FormData
//     if (typeof challanPayload.items === 'string') {
//         challanPayload.items = JSON.parse(challanPayload.items);
//     }

//     const challan = await Challan.create(challanPayload);

//     return res.status(201).json({ success: true, challan });
// });

exports.uploadBiltiSlip = catchAsyncErrors(async (req, res, next) => {
    const { challanId } = req.body;
    if (!challanId) return next(new ErrorHandler('Challan ID is required', 400));

    const challan = await Challan.findById(challanId);
    if (!challan) return next(new ErrorHandler('Challan not found', 404));

    let url = '';
    if (req.file) {
        url = await uploadImage(req.file.path);
        deleteLocalFile(req.file.path);
        challan.biltiSlipUrl = url;
        await challan.save();
    }

    res.status(200).json({ success: true, url });
});

exports.removeBiltiSlip = catchAsyncErrors(async (req, res, next) => {
    const { challanId } = req.body;
    const challan = await Challan.findById(challanId);
    if (!challan) return next(new ErrorHandler('Challan not found', 404));

    if (challan?.biltiSlipUrl) {
        await deleteImage(challan.biltiSlipUrl);
    }
    challan.biltiSlipUrl = '';
    await challan.save();

    res.status(200).json({ success: true, message: 'Bilti slip removed' });
});

// 📖 GET all Challans
exports.getAllChallans = catchAsyncErrors(async (req, res, next) => {
    const challans = await Challan.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: challans.length, challans, });
});

// exports.getAllChallansWithPagination = catchAsyncErrors(async (req, res, next) => {
//     // 🔹 Pagination
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
//     const search = filter.search || '';
//     const status = filter.status || '';
//     const customer = filter.client || '';

//     console.log("GGGG:=>", filter)
//     // 🔹 Search query
//     // const search = req.query.search || "";

//     // Build MongoDB query
//     const query = {};

//     if (search) {
//         // case-insensitive partial match on multiple fields
//         query.$or = [
//             { challanNumber: { $regex: search, $options: "i" } },
//             { customer: { $regex: search, $options: "i" } },
//             { orderNumber: { $regex: search, $options: "i" } },
//             { status: { $regex: search, $options: "i" } },
//         ];
//     }

//     // Optional: filter by status explicitly
//     if (status) {
//         query.status = filter?.status;
//     }

//     // 🔹 Count & fetch
//     const total = await Challan.countDocuments(query);

//     const challans = await Challan.find(query)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit);

//     res.status(200).json({
//         success: true,
//         count: challans.length,
//         total,
//         currentPage: page,
//         totalPages: Math.ceil(total / limit),
//         challans,
//     });
// });


exports.getAllChallansWithPagination = catchAsyncErrors(async (req, res, next) => {
    // 🔹 Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 🔹 Read filters
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    const search = filter.search?.trim() || '';
    const status = filter.status || '';
    const customer = filter.client || '';
    const dateFrom = filter.dateFrom || '';
    const dateTo = filter.dateTo || '';

    console.log("GGGG:=>", filter);

    // 🔹 Build MongoDB query
    const query = {};

    // Date range
    if (dateFrom || dateTo) {
        query.date = {};
        if (dateFrom) query.date.$gte = new Date(dateFrom);
        if (dateTo) {
            // include whole day of 'to'
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            query.date.$lte = to;
        }
    }

    // Status filter
    if (status) {
        query.status = status;
    }

    // Customer filter
    if (customer) {
        query.customer = { $regex: customer, $options: 'i' };
    }

    // Search on multiple fields
    if (search) {
        query.$or = [
            { challanNumber: { $regex: search, $options: 'i' } },
            { customer: { $regex: search, $options: 'i' } },
            { orderNumber: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
        ];
    }

    // 🔹 Count & fetch
    const total = await Challan.countDocuments(query);

    const challans = await Challan.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    res.status(200).json({
        success: true,
        count: challans.length,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        challans,
    });
});
// 📖 GET single Challan by ID
exports.getChallanById = catchAsyncErrors(async (req, res, next) => {
    const challan = await Challan.findById(req.params.id);

    if (!challan) {
        return res.status(404).json({ success: false, message: "Challan not found" });
    }

    res.status(200).json({
        success: true,
        challan,
    });
});

// ✏️ UPDATE Challan;

exports.updateChallan = catchAsyncErrors(async (req, res, next) => {
    const challanId = req.params.id;

    // 1. Check if challan exists
    let challan = await Challan.findById(challanId);
    if (!challan) {
        return res.status(404).json({ success: false, message: "Challan not found" });
    }

    console.log("Request body for update =>", req.body.data);

    challan.status = req.body.data.status || challan?.status;
    challan.challanNumber = req.body.data.challanNumber || challan.challanNumber;
    challan.customer = req.body.data.customer || challan.customer;
    challan.orderNumber = req.body.data.orderNumber || challan.orderNumber;
    challan.items = req.body.data.items || challan.items;
    challan.deliveryVendor = req.body.data.deliveryVendor || challan.deliveryVendor;
    challan.notes = req.body.data.notes || challan.notes;
    challan.vendor = req.body.data.vendor || challan.vendor;
    challan.customerId = req.body.data.customerId || challan.customerId;
    challan.vendorId = req.body.data.vendorId || challan.vendorId;
    challan.orderId = req.body.data.orderId || challan.orderId;
    challan.dispatchedQty = req.body.data.dispatchedQty || challan.dispatchedQty;
    challan.quantity = req.body.data.quantity || challan.quantity;
    challan.price = req.body.data.price || challan.price;
    challan.pcsInSet = req.body.data.pcsInSet || challan.pcsInSet;
    challan.images = req.body.data.images || challan.images;

    challan = await challan.save();

    // console.log("Updated challan =>", challan);

    const ExistOrder = await AdminOrder.findOne({ _id: req.body.data.orderId });

    if (!ExistOrder) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (Array.isArray(req.body.data.items)) {
        req.body.data.items.forEach(bodyItem => {
            // find the matching item in the order by name or productId
            const orderItem = ExistOrder.items.find(
                i => i.name === bodyItem.name // or i.productId.equals(bodyItem.productId)
            );

            if (orderItem) {
                // update dispatchedQty and anything else you want
                orderItem.dispatchedQty = Number(bodyItem.dispatchedQty) || orderItem.dispatchedQty;
                orderItem.deliveredPcs = (orderItem.dispatchedQty * orderItem.pcsInSet)
                // optionally update deliveredPcs, etc.
                // orderItem.deliveredPcs = (orderItem.quantity * orderItem.pcsInSet)
            }
        });

        // tell mongoose that the items array has been modified
        ExistOrder.markModified('items');
    }
    console.log("ExistOrder:==>", ExistOrder.status)
    ExistOrder.status = 'Shipped';
    ExistOrder.statusHistory.push({
        status: 'Shipped',
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        updatedBy: "Admin",
    });

    ExistOrder.trackingId = req.body.data.notes || ExistOrder.trackingId;
    ExistOrder.deliveryVendor = req.body.data.vendor || ExistOrder.deliveryVendor;

    // persist changes
    await ExistOrder.save();


    // 3. Send response
    return res.status(200).json({ success: true, challan });
});

// 🗑️ DELETE Challan
exports.deleteChallan = catchAsyncErrors(async (req, res, next) => {
    const challan = await Challan.findById(req.params.id);

    if (!challan) {
        return res.status(404).json({ success: false, message: "Challan not found" });
    }

    await challan.deleteOne();

    res.status(200).json({
        success: true,
        message: "Challan deleted successfully",
    });
});

// Update Challan Status
exports.updateChallanStatus = catchAsyncErrors(async (req, res, next) => {
    const challan = await Challan.findById(req.params.id);

    if (!challan) {
        return res.status(404).json({ success: false, message: "Challan not found" });
    }

    challan.status = req.body.newStatus || challan.status;
    await challan.save();

    res.status(200).json({ success: true, message: "Challan status updated successfully", });
});

// exports.getChallansReport = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const { reportFilters = {} } = req.body;

//     let startDate = new Date();
//     let endDate = new Date();

//     if (reportFilters.period === 'daily') {
//       startDate.setDate(endDate.getDate() - 7);
//     } else if (reportFilters.period === 'monthly') {
//       startDate.setMonth(endDate.getMonth() - 12);
//     } else if (reportFilters.period === 'yearly') {
//       startDate.setFullYear(endDate.getFullYear() - 5);
//     } else if (reportFilters.period === 'custom' && reportFilters.customDateFrom && reportFilters.customDateTo) {
//       startDate = new Date(reportFilters.customDateFrom);
//       endDate = new Date(reportFilters.customDateTo);
//     }

//     const match = {
//       date: { $gte: startDate, $lte: endDate },
//     };

//     if (reportFilters.status) match.status = reportFilters.status;

//     // get all challans in that range
//     const challans = await Challan.find(match);

//     const total = challans.length;
//     const totalValueNumber = challans.reduce((sum, c) => sum + (c?.totalValue || 0), 0);

//     // average per day for this period
//     const days =
//       Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
//     const avgPerDay = +(total / days).toFixed(1);

//     // you can compute trend from previous period if you want; for now static
//     const trend = total >= 0 ? '+12.5%' : '-8.2%';
//     const trendColor = total >= 0 ? 'text-green-600' : 'text-red-600';

//     res.status(200).json({
//       total,
//       trend,
//       trendColor,
//       totalValue: `₹${totalValueNumber.toLocaleString()}`,
//       avgPerDay,
//       // send raw data as well for chart
//       rawData: challans,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });


exports.getChallansReport = catchAsyncErrors(async (req, res, next) => {
    try {
        const { reportFilters = {} } = req.body;

        let startDate = new Date();
        let endDate = new Date();

        if (reportFilters.period === 'daily') {
            startDate.setDate(endDate.getDate() - 7);
        } else if (reportFilters.period === 'monthly') {
            startDate.setMonth(endDate.getMonth() - 12);
        } else if (reportFilters.period === 'yearly') {
            startDate.setFullYear(endDate.getFullYear() - 5);
        } else if (
            reportFilters.period === 'custom' &&
            reportFilters.customDateFrom &&
            reportFilters.customDateTo
        ) {
            startDate = new Date(reportFilters.customDateFrom);
            endDate = new Date(reportFilters.customDateTo);
        }

        // build match filter
        const match = { date: { $gte: startDate, $lte: endDate } };
        if (reportFilters.status) match.status = reportFilters.status;

        // current period challans
        const currentChallans = await Challan.find(match);

        const total = currentChallans.length;
        const totalValueNumber = currentChallans.reduce((sum, c) => sum + (c.totalValue || 0), 0);

        // average per day
        const days = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
        const avgPerDay = +(total / days).toFixed(1);

        // 🔥 compute previous period (same length)
        const prevEnd = new Date(startDate);
        const prevStart = new Date(startDate);
        prevStart.setDate(prevStart.getDate() - days); // go back by same number of days/months
        const prevMatch = { date: { $gte: prevStart, $lt: prevEnd } };
        if (reportFilters.status) prevMatch.status = reportFilters.status;

        const prevChallans = await Challan.find(prevMatch);
        const prevTotal = prevChallans.length;

        // now calculate % change
        let trendPercent = 0;
        if (prevTotal > 0) {
            trendPercent = ((total - prevTotal) / prevTotal) * 100;
        } else if (total > 0) {
            trendPercent = 100; // from 0 to something
        }

        const trend =
            (trendPercent >= 0 ? '+' : '') + trendPercent.toFixed(1) + '%';
        const trendColor = trendPercent >= 0 ? 'text-green-600' : 'text-red-600';

        res.status(200).json({ total, trend, trendColor, totalValue: `₹${totalValueNumber.toLocaleString()}`, avgPerDay, rawData: currentChallans, });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


exports.getAllChallansByCustomerAndOrder = catchAsyncErrors(async (req, res, next) => {
    try {
        const { orderId, customerId } = req.body;
        console.log("challans:==>", req.body);
        const challans = await Challan.find({ orderId, customerId });
        console.log("challans:==>", challans);
        res.status(200).json({ status: true, data: challans });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
})