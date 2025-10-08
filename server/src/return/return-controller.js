const Return = require("./return-model"); // path to your model
const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const { AdminOrder } = require("../orders/orders-model");

// 📝 CREATE a return
exports.createReturn = catchAsyncErrors(async (req, res, next) => {

    const year = new Date().getFullYear();
    console.log("SSSS:==>", req.body.data)
    // Get the latest Return of this year
    const lastReturn = await Return.findOne({ returnNumber: { $regex: `^RET-${year}` } }).sort({ createdAt: -1 }).lean();

    let serial = 1;

    if (lastReturn && lastReturn.returnNumber) {
        const parts = lastReturn.returnNumber.split("-");
        const lastSerial = parseInt(parts[2], 10);
        serial = lastSerial + 1;
    }

    const challanNumber = `RET-${year}-${serial.toString().padStart(3, "0")}`;
    if (req.body.data.orderId.length > 0) {
        const ExistOrder = await AdminOrder.findOne({ _id: req.body.data.orderId });

        if (!ExistOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        console.log("bodyItem.dispatchedQty:==>", ExistOrder, req.body.data.orderId)
        if (Array.isArray(req.body.data.items)) {
            req.body.data.items.forEach(bodyItem => {
                // find the matching item in the order by name or productId
                const orderItem = ExistOrder.items.find(
                    i => i.name === bodyItem.name // or i.productId.equals(bodyItem.productId)
                );

                if (orderItem) {
                    // update dispatchedQty and anything else you want
                    console.log("bodyItem.dispatchedQty:==>", bodyItem.returnPcs)
                    // console.log("bodyItem.alreadyDispatched:==>", bodyItem.alreadyReturned, req.body.items)

                    orderItem.returnPcs = (Number(bodyItem.returnPcs) + Number(bodyItem.alreadyReturned || 0)) || orderItem.returnPcs;
                    // orderItem.deliveredPcs = (orderItem.dispatchedQty * orderItem.pcsInSet)
                    // optionally update deliveredPcs, etc.
                    // orderItem.deliveredPcs = (orderItem.quantity * orderItem.pcsInSet)
                }
            });

            // tell mongoose that the items array has been modified
            ExistOrder.markModified('items');
        }
        // console.log("ExistOrder:==>", ExistOrder.status)
        // ExistOrder.status = 'Returned';
        ExistOrder.statusHistory.push({
            status: 'Returned',
            date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
            updatedBy: "Admin",
            notes: req.body.data.reason || req.body.data.items[0].reason
        });

        // ExistOrder.trackingId = req.body.notes || ExistOrder.trackingId;
        // ExistOrder.deliveryVendor = req.body.vendor || ExistOrder.deliveryVendor;

        // persist changes
        await ExistOrder.save();
    }


    const returns = await Return.create({ ...req.body.data, orderId: req.body.data.orderId ? req.body.data.orderId : null, returnNumber: challanNumber });
    console.log("SSSS:==>", returns)
    res.status(201).json({ success: true, returns, });
});

// 📖 GET all Return
exports.getAllReturn = catchAsyncErrors(async (req, res, next) => {
    const returns = await Return.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: returns.length, returns, });
});

exports.getAllReturnWithPagination = catchAsyncErrors(async (req, res, next) => {
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
            { returnNumber: { $regex: search, $options: 'i' } },
            { customer: { $regex: search, $options: 'i' } },
            { orderNumber: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
        ];
    }

    // 🔹 Count & fetch
    const total = await Return.countDocuments(query);

    const returns = await Return.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("customerId").populate("orderId");

    res.status(200).json({ success: true, count: returns.length, total, currentPage: page, totalPages: Math.ceil(total / limit), returns, });
});

// 📖 GET single Return by ID
exports.getReturnById = catchAsyncErrors(async (req, res, next) => {
    const returns = await Return.findById(req.params.id);

    if (!returns) {
        return res.status(404).json({ success: false, message: "Return not found" });
    }

    res.status(200).json({
        success: true,
        returns,
    });
});

// ✏️ UPDATE Return;

exports.updateReturn = catchAsyncErrors(async (req, res, next) => {
    const ReturnId = req.params.id;

    // 1. Check if Return exists
    let returns = await Return.findById(ReturnId);
    if (!returns) {
        return res.status(404).json({ success: false, message: "returns not found" });
    }

    console.log("Request body for update Body ==>", req.body?.data.orderId);

    returns.status = req.body.data.status || returns?.status;
    returns.returnNumber = req.body.data.returnNumber || returns.returnNumber;
    returns.customer = req.body.data.customer || returns.customer;
    returns.orderNumber = req.body.data.orderNumber || returns.orderNumber;
    returns.items = req.body.data.items || returns.items;
    returns.deliveryVendor = req.body.data.deliveryVendor || returns.deliveryVendor;
    returns.notes = req.body.data.notes || returns.notes;
    returns.vendor = req.body.data.vendor || returns.vendor;
    returns.customerId = req.body.data.customerId || returns.customerId;
    returns.orderId = req.body.data.orderId || returns?.orderId;
    returns.dispatchedQty = req.body.data.dispatchedQty || returns.dispatchedQty;
    returns.quantity = req.body.data.quantity || returns.quantity;
    returns.price = req.body.data.price || returns.price;
    returns.pcsInSet = req.body.data.pcsInSet || returns.pcsInSet;
    returns.images = req.body.data.images || returns.images;
    returns.reason = req?.body?.data?.reason || returns?.reason;

    returns = await returns.save();

    // console.log("Updated returns =>", returns);

    // 3. Send response
    return res.status(200).json({ success: true, returns });
});

// 🗑️ DELETE returns
exports.deleteReturn = catchAsyncErrors(async (req, res, next) => {
    const returns = await Return.findById(req.params.id);

    if (!returns) {
        return res.status(404).json({ success: false, message: "Return not found" });
    }

    await returns.deleteOne();

    res.status(200).json({
        success: true,
        message: "Return deleted successfully",
    });
});

// Update Return Status
exports.updateReturnStatus = catchAsyncErrors(async (req, res, next) => {
    const returns = await Return.findById(req.params.id);

    if (!returns) {
        return res.status(404).json({ success: false, message: "Return not found" });
    }

    returns.status = req.body.newStatus || returns.status;
    await returns.save();

    res.status(200).json({ success: true, message: "Return status updated successfully", });
});

exports.getReturnReport = catchAsyncErrors(async (req, res, next) => {
    try {
        const { reportFilters = {} } = req.body;

        // Default to now
        let startDate = new Date();
        let endDate = new Date();

        // Period filter
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

        // Match for current period
        const match = { date: { $gte: startDate, $lte: endDate } };
        if (reportFilters.status) match.status = reportFilters.status;

        // Current period returns
        const currentReturns = await Return.find(match).lean();

        // Totals
        const total = currentReturns.length;
        const totalRefundNumber = currentReturns.reduce(
            (sum, c) => sum + (c?.totalRefund || 0),
            0
        );

        // Average per day
        const days = Math.max(
            1,
            Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
        );
        const avgPerDay = +(total / days).toFixed(1);

        // 🔥 Previous period (same length)
        const prevEnd = new Date(startDate); // previous period ends where current started
        const prevStart = new Date(startDate);
        prevStart.setDate(prevStart.getDate() - days); // same length backwards

        const prevMatch = { date: { $gte: prevStart, $lt: prevEnd } };
        if (reportFilters.status) prevMatch.status = reportFilters.status;

        const prevReturns = await Return.find(prevMatch).lean();
        const prevTotal = prevReturns.length;

        // Trend calculation
        let trendPercent = 0;
        if (prevTotal > 0) {
            trendPercent = ((total - prevTotal) / prevTotal) * 100;
        } else if (total > 0) {
            trendPercent = 100; // from 0 to something
        }

        const trend =
            (trendPercent >= 0 ? '+' : '') + trendPercent.toFixed(1) + '%';
        const trendColor = trendPercent >= 0 ? 'text-green-600' : 'text-red-600';

        res.status(200).json({
            total,
            trend,
            trendColor,
            totalValue: `₹${totalRefundNumber.toLocaleString()}`,
            avgPerDay,
            rawData: currentReturns, // send actual returns for charting
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


exports.getAllReturnsByCustomerAndOrder = catchAsyncErrors(async (req, res, next) => {
    try {
        const { orderId, customerId } = req.body;
        console.log("returns:==>", req.body);
        const returns = await Return.find({ orderId, customerId });
        console.log("returns:==>", returns);
        res.status(200).json({ status: true, data: returns });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
})

