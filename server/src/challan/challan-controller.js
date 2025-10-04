const Challan = require("./challan-model"); // path to your model
const catchAsyncErrors = require("../../middleware/catchAsyncErrors");

// 📝 CREATE a Challan
exports.createChallan = catchAsyncErrors(async (req, res, next) => {

    const year = new Date().getFullYear();

    // Get the latest challan of this year
    const lastChallan = await Challan.findOne({ challanNumber: { $regex: `^CHN-${year}` } })
        .sort({ createdAt: -1 })
        .lean();

    let serial = 1;

    if (lastChallan && lastChallan.challanNumber) {
        const parts = lastChallan.challanNumber.split("-");
        const lastSerial = parseInt(parts[2], 10);
        serial = lastSerial + 1;
    }

    const challanNumber = `CHN-${year}-${serial.toString().padStart(3, "0")}`;

    //     const ExistOrder = await AdminOrder.findOne({ _id: req.body.orderId });

    //     if (!ExistOrder) {
    //         return res.status(404).json({ success: false, message: "Order not found" });
    //     }
    // ExistOrder.dispatchedQty = req.body.dispatchedQty || ExistOrder.dispatchedQty;
    // ExistOrder.quantity = req.body.quantity || ExistOrder.quantity;
    // ExistOrder.price = req.body.price || ExistOrder.price;
    // ExistOrder.pcsInSet = req.body.pcsInSet || ExistOrder.pcsInSet;
    // ExistOrder.images = req.body.images || ExistOrder.images;
    // ExistOrder.save();

    const challan = await Challan.create({ ...req.body, challanNumber });
    console.log("SSSS:==>", challan)
    res.status(201).json({ success: true, challan, });
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
