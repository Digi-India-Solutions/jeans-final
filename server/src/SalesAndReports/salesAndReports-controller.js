// // const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
// // const ErrorHandler = require("../../utils/ErrorHandler");
// // const { AdminOrder } = require("../orders/orders-model");

// // // ─── Cache ─────────────────────────────────────────────────────────────────────
// // const salesCache = {};
// // const SALES_TTL = 0.2 * 60 * 1000;
// // const getSalesCache = (key) => {
// //     const entry = salesCache[key];
// //     if (!entry) return null;
// //     if (Date.now() - entry.time > SALES_TTL) { delete salesCache[key]; return null; }
// //     return entry.data;
// // };
// // const setSalesCache = (key, data) => { salesCache[key] = { data, time: Date.now() }; };

// // // ─── Shared populate ───────────────────────────────────────────────────────────
// // const salesPopulate = {
// //     path: "items.productId",
// //     select: "productId singlePicPrice pcsInSet quantity",
// //     populate: {
// //         path: "productId",
// //         model: "Product",
// //         select: "mainCategoryId",
// //         populate: { path: "mainCategoryId", model: "MainCategory", select: "mainCategoryName" }
// //     }
// // };

// // const calcGrowth = (curr, prev) =>
// //     prev === 0 ? (curr === 0 ? 0 : 100) : ((curr - prev) / prev) * 100;

// // const getDateKey = date => new Date(date).toISOString().split("T")[0];

// // // ─── getJeansShirtRevenueAndOrder ──────────────────────────────────────────────
// // exports.getJeansShirtRevenueAndOrder = catchAsyncErrors(async (req, res, next) => {
// //     try {
// //         const now = new Date();
// //         const { range, startDate, endDate } = req.query;

// //         const cacheKey = `revenue_${range}_${startDate}_${endDate}`;
// //         const cached = getSalesCache(cacheKey);
// //         if (cached) return res.status(200).json(cached);

// //         let start, end;
// //         switch (range) {
// //             case "today":
// //                 start = new Date(new Date().setHours(0,0,0,0));
// //                 end = new Date(new Date().setHours(23,59,59,999));
// //                 break;
// //             case "thisWeek":
// //                 start = new Date(now);
// //                 start.setDate(now.getDate() - now.getDay());
// //                 start.setHours(0,0,0,0);
// //                 end = new Date();
// //                 break;
// //             case "thisMonth":
// //                 start = new Date(now.getFullYear(), now.getMonth(), 1);
// //                 end = new Date(now.getFullYear(), now.getMonth()+1, 0, 23,59,59,999);
// //                 break;
// //             case "custom":
// //                 start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
// //                 end = endDate ? new Date(endDate) : new Date();
// //                 break;
// //             default:
// //                 start = new Date(now.getFullYear(), now.getMonth(), 1);
// //                 end = new Date();
// //         }

// //         const diff = end - start;
// //         const lastStart = new Date(start.getTime() - diff);
// //         const lastEnd = new Date(start.getTime() - 1);

// //         const orders = await AdminOrder.find({
// //             status: { $ne: "Cancelled" },
// //             recycleBin: { $ne: true },
// //             createdAt: { $gte: lastStart, $lte: end },
// //         })
// //         .select("items createdAt")
// //         .populate(salesPopulate)
// //         .lean();

// //         const buckets = {
// //             jeans: { current: { total: 0, pieces: 0, orders: 0 }, last: { total: 0 } },
// //             shirts: { current: { total: 0, pieces: 0, orders: 0 }, last: { total: 0 } },
// //         };

// //         orders.forEach(order => {
// //             const isCurrent = order.createdAt >= start && order.createdAt <= end;
// //             const isLast = order.createdAt >= lastStart && order.createdAt <= lastEnd;
// //             let hasJeans = false;
// //             let hasShirts = false;

// //             order.items.forEach(item => {
// //                 const category = item?.productId?.productId?.mainCategoryId?.mainCategoryName?.toUpperCase() || "";
// //                 const qty = Number(item.quantity || 0);
// //                 const pcsInSet = Number(item.pcsInSet || 1);
// //                 const price = Number(item.singlePicPrice || 0);
// //                 if (!qty || !price) return;
// //                 const totalPcs = qty * pcsInSet;
// //                 const totalAmount = totalPcs * price;

// //                 if (category.includes("JEANS")) {
// //                     if (isCurrent) { buckets.jeans.current.total += totalAmount; buckets.jeans.current.pieces += totalPcs; }
// //                     if (isLast) buckets.jeans.last.total += totalAmount;
// //                     hasJeans = true;
// //                 }
// //                 if (category.includes("SHIRT")) {
// //                     if (isCurrent) { buckets.shirts.current.total += totalAmount; buckets.shirts.current.pieces += totalPcs; }
// //                     if (isLast) buckets.shirts.last.total += totalAmount;
// //                     hasShirts = true;
// //                 }
// //             });

// //             if (isCurrent && hasJeans) buckets.jeans.current.orders++;
// //             if (isCurrent && hasShirts) buckets.shirts.current.orders++;
// //         });

// //         const result = {
// //             success: true,
// //             data: {
// //                 jeans: { ...buckets.jeans.current, growth: calcGrowth(buckets.jeans.current.total, buckets.jeans.last.total).toFixed(2) },
// //                 shirts: { ...buckets.shirts.current, growth: calcGrowth(buckets.shirts.current.total, buckets.shirts.last.total).toFixed(2) },
// //                 totalOrder: orders.length
// //             }
// //         };
// //         setSalesCache(cacheKey, result);
// //         return res.status(200).json(result);

// //     } catch (err) {
// //         next(new ErrorHandler(err.message, 500));
// //     }
// // });

// // // ─── getSalesData ──────────────────────────────────────────────────────────────
// // exports.getSalesData = catchAsyncErrors(async (req, res, next) => {
// //     try {
// //         const now = new Date();
// //         const { range, startDate, endDate } = req.query;

// //         const cacheKey = `salesData_${range}_${startDate}_${endDate}`;
// //         const cached = getSalesCache(cacheKey);
// //         if (cached) return res.status(200).json(cached);

// //         let start, end;
// //         switch (range) {
// //             case "Daily":
// //             case "today":
// //                 start = new Date(new Date().setHours(0,0,0,0));
// //                 end = new Date(new Date().setHours(23,59,59,999));
// //                 break;
// //             case "Weekly":
// //             case "thisWeek":
// //                 start = new Date(now);
// //                 start.setDate(now.getDate() - now.getDay());
// //                 start.setHours(0,0,0,0);
// //                 end = new Date();
// //                 break;
// //             case "Monthly":
// //             case "thisMonth":
// //                 start = new Date(now.getFullYear(), now.getMonth(), 1);
// //                 end = new Date(now.getFullYear(), now.getMonth()+1, 0, 23,59,59,999);
// //                 break;
// //             case "Yearly":
// //             case "thisYear":
// //                 start = new Date(now.getFullYear(), 0, 1);
// //                 end = new Date(now.getFullYear(), 11, 31, 23,59,59,999);
// //                 break;
// //             case "custom":
// //                 start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
// //                 end = endDate ? new Date(endDate) : new Date();
// //                 break;
// //             default:
// //                 start = new Date(now.getFullYear(), now.getMonth(), 1);
// //                 end = new Date();
// //         }

// //         const diff = end - start;
// //         const lastStart = new Date(start.getTime() - diff);
// //         const lastEnd = new Date(start.getTime() - 1);

// //         const orders = await AdminOrder.find({
// //             status: { $ne: "Cancelled" },
// //             recycleBin: { $ne: true },
// //             createdAt: { $gte: lastStart, $lte: end },
// //         })
// //         .select("items createdAt")
// //         .populate(salesPopulate)
// //         .lean();

// //         const buckets = {
// //             jeans: { current: { total: 0, orders: 0, pieces: 0, dailyData: [] }, last: { total: 0 } },
// //             shirts: { current: { total: 0, orders: 0, pieces: 0, dailyData: [] }, last: { total: 0 } }
// //         };

// //         orders.forEach(order => {
// //             const isCurrent = order.createdAt >= start && order.createdAt <= end;
// //             const isLast = order.createdAt >= lastStart && order.createdAt <= lastEnd;
// //             let hasJeans = false;
// //             let hasShirts = false;

// //             order.items.forEach(item => {
// //                 const category = item?.productId?.productId?.mainCategoryId?.mainCategoryName?.toUpperCase() || "";
// //                 const key = category.includes("JEANS") ? "jeans" : category.includes("SHIRT") ? "shirts" : null;
// //                 if (!key) return;

// //                 const qty = Number(item.quantity || 0);
// //                 const pcsInSet = Number(item.pcsInSet || 1);
// //                 const price = Number(item.singlePicPrice || 0);
// //                 if (!qty || !price) return;

// //                 const totalPcs = qty * pcsInSet;
// //                 const totalAmount = totalPcs * price;

// //                 if (isCurrent) {
// //                     buckets[key].current.total += totalAmount;
// //                     buckets[key].current.pieces += totalPcs;
// //                     const dateKey = getDateKey(order.createdAt);
// //                     let daily = buckets[key].current.dailyData.find(d => d.date === dateKey);
// //                     if (!daily) { daily = { date: dateKey, sales: 0, pieces: 0, orders: 0 }; buckets[key].current.dailyData.push(daily); }
// //                     daily.sales += totalAmount;
// //                     daily.pieces += totalPcs;
// //                 }
// //                 if (isLast) buckets[key].last.total += totalAmount;
// //                 if (key === "jeans") hasJeans = true;
// //                 if (key === "shirts") hasShirts = true;
// //             });

// //             if (isCurrent && hasJeans) buckets.jeans.current.orders++;
// //             if (isCurrent && hasShirts) buckets.shirts.current.orders++;
// //         });

// //         const response = {};
// //         Object.keys(buckets).forEach(key => {
// //             const data = buckets[key];
// //             response[key] = {
// //                 total: data.current.total,
// //                 orders: data.current.orders,
// //                 pieces: data.current.pieces,
// //                 growth: calcGrowth(data.current.total, data.last.total).toFixed(2),
// //                 dailyData: data.current.dailyData.sort((a, b) => new Date(a.date) - new Date(b.date)),
// //                 avgOrder: data.current.orders ? Math.round(data.current.total / data.current.orders) : 0
// //             };
// //         });

// //         const result = { success: true, data: response };
// //         setSalesCache(cacheKey, result);
// //         return res.status(200).json(result);

// //     } catch (err) {
// //         next(new ErrorHandler(err.message, 500));
// //     }
// // });

// // // ─── getTopProducts ────────────────────────────────────────────────────────────
// // exports.getTopProducts = async (req, res, next) => {
// //     try {
// //         const now = new Date();
// //         const { range } = req.query;

// //         const cacheKey = `topProducts_${range}`;
// //         const cached = getSalesCache(cacheKey);
// //         if (cached) return res.status(200).json(cached);

// //         let start = new Date(now.getFullYear(), now.getMonth(), 1);
// //         let end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

// //         if (range === "today") {
// //             start = new Date(now.setHours(0, 0, 0, 0));
// //             end = new Date(now.setHours(23, 59, 59, 999));
// //         } else if (range === "thisWeek") {
// //             const day = now.getDay();
// //             start = new Date(now);
// //             start.setDate(now.getDate() - day);
// //             start.setHours(0, 0, 0, 0);
// //             end = new Date();
// //         }

// //         const diff = end.getTime() - start.getTime();
// //         const lastStart = new Date(start.getTime() - diff);
// //         const lastEnd = new Date(start.getTime() - 1);

// //         const orders = await AdminOrder.find({
// //             createdAt: { $gte: lastStart, $lte: end },
// //             status: { $ne: "Cancelled" },
// //             recycleBin: { $ne: true },
// //         })
// //         .select("items createdAt")
// //         .populate({ path: "items.productId", select: "name singlePicPrice pcsInSet quantity color" })
// //         .lean();

// //         const productMap = {};
// //         orders.forEach(order => {
// //             const isCurrent = order.createdAt >= start && order.createdAt <= end;
// //             const isLast = order.createdAt >= lastStart && order.createdAt <= lastEnd;

// //             order.items.forEach(item => {
// //                 const name = item?.color || item?.productId?.name || "Unknown Product";
// //                 const lineSales = (item.singlePicPrice || 0) * (item?.pcsInSet || 1) * (item?.quantity || 0);
// //                 const pieces = (item?.pcsInSet || 1) * (item?.quantity || 0);

// //                 if (!productMap[name]) {
// //                     productMap[name] = { name, current: { sales: 0, pieces: 0, units: 0 }, last: { sales: 0 } };
// //                 }
// //                 if (isCurrent) { productMap[name].current.sales += lineSales; productMap[name].current.pieces += pieces; productMap[name].current.units += item.quantity || 0; }
// //                 if (isLast) productMap[name].last.sales += lineSales;
// //             });
// //         });

// //         let products = Object.values(productMap).map(p => ({
// //             name: p.name,
// //             sales: p.current.sales,
// //             pieces: p.current.pieces,
// //             units: p.current.units,
// //             growth: parseFloat(calcGrowth(p.current.sales, p.last.sales).toFixed(2)),
// //         }));

// //         products.sort((a, b) => b.sales - a.sales);

// //         const result = { success: true, data: products.slice(0, 10) };
// //         setSalesCache(cacheKey, result);
// //         return res.status(200).json(result);

// //     } catch (err) {
// //         console.error(err);
// //         res.status(500).json({ success: false, message: err.message });
// //     }
// // };



// const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
// const ErrorHandler = require("../../utils/ErrorHandler");
// const { AdminOrder } = require("../orders/orders-model");

// // ───────────────── CACHE ─────────────────
// const salesCache = {};
// const SALES_TTL = 0.2 * 60 * 1000;

// const getSalesCache = (key) => {
//     const entry = salesCache[key];

//     if (!entry) return null;

//     if (Date.now() - entry.time > SALES_TTL) {
//         delete salesCache[key];
//         return null;
//     }

//     return entry.data;
// };

// const setSalesCache = (key, data) => {
//     salesCache[key] = {
//         data,
//         time: Date.now(),
//     };
// };

// // ───────────────── POPULATE ─────────────────
// const salesPopulate = {
//     path: "items.productId",
//     model:"SubProduct",

//     populate: {
//         path: "productId",
//         model: "Product",
//         select: "mainCategoryId",
//         populate: { path: "mainCategoryId", model: "MainCategory", select: "mainCategoryName" }
//     }
// };

// // ───────────────── HELPERS ─────────────────
// const calcGrowth = (curr, prev) => {
//     if (prev === 0) return curr === 0 ? 0 : 100;
//     return ((curr - prev) / prev) * 100;
// };

// const getDateKey = (date) => {
//     return new Date(date).toISOString().split("T")[0];
// };

// const getDateRange = (range, startDate, endDate) => {
//     const now = new Date();

//     let start;
//     let end;

//     switch (range) {
//         case "Daily":
//         case "today":
//             start = new Date(now.setHours(0, 0, 0, 0));
//             end = new Date(now.setHours(23, 59, 59, 999));
//             break;

//         case "Weekly":
//         case "thisWeek":
//             start = new Date();
//             start.setDate(start.getDate() - start.getDay());
//             start.setHours(0, 0, 0, 0);

//             end = new Date();
//             break;

//         case "Monthly":
//         case "thisMonth":
//             start = new Date(now.getFullYear(), now.getMonth(), 1);

//             end = new Date(
//                 now.getFullYear(),
//                 now.getMonth() + 1,
//                 0,
//                 23,
//                 59,
//                 59,
//                 999
//             );
//             break;

//         case "Yearly":
//         case "thisYear":
//             start = new Date(now.getFullYear(), 0, 1);

//             end = new Date(
//                 now.getFullYear(),
//                 11,
//                 31,
//                 23,
//                 59,
//                 59,
//                 999
//             );
//             break;

//         case "custom":
//             start = startDate
//                 ? new Date(startDate)
//                 : new Date(now.getFullYear(), now.getMonth(), 1);

//             end = endDate
//                 ? new Date(endDate)
//                 : new Date();

//             break;

//         default:
//             start = new Date(now.getFullYear(), now.getMonth(), 1);
//             end = new Date();
//     }

//     return { start, end };
// };

// // ───────────────── COMMON ORDER FETCH ─────────────────
// const fetchOrders = async (start, end, lastStart) => {
//     return await AdminOrder.find({
//         status: { $ne: "Cancelled" },
//         recycleBin: { $ne: true },
//         createdAt: {
//             $gte: lastStart,
//             $lte: end,
//         },
//     })
//         .select("items createdAt")
//         .populate(salesPopulate)
//         .lean();
// };

// // ───────────────── GET REVENUE ─────────────────
// exports.getJeansShirtRevenueAndOrder = catchAsyncErrors(
//     async (req, res, next) => {
//         try {
//             const { range, startDate, endDate } = req.query;

//             const cacheKey = `revenue_${range}_${startDate}_${endDate}`;

//             const cached = getSalesCache(cacheKey);

//             if (cached) {
//                 return res.status(200).json(cached);
//             }

//             const { start, end } = getDateRange(
//                 range,
//                 startDate,
//                 endDate
//             );

//             const diff = end - start;

//             const lastStart = new Date(start.getTime() - diff);
//             const lastEnd = new Date(start.getTime() - 1);

//             const orders = await fetchOrders(start, end, lastStart);

//             const buckets = {
//                 jeans: {
//                     current: {
//                         total: 0,
//                         pieces: 0,
//                         orders: 0,
//                     },
//                     last: {
//                         total: 0,
//                     },
//                 },

//                 shirts: {
//                     current: {
//                         total: 0,
//                         pieces: 0,
//                         orders: 0,
//                     },
//                     last: {
//                         total: 0,
//                     },
//                 },
//             };

//             orders.forEach((order) => {
//                 const isCurrent =
//                     order.createdAt >= start &&
//                     order.createdAt <= end;

//                 const isLast =
//                     order.createdAt >= lastStart &&
//                     order.createdAt <= lastEnd;

//                 let hasJeans = false;
//                 let hasShirts = false;

//                 order.items.forEach((item) => {
//                     const category =
//                         item?.productId?.mainCategoryId?.mainCategoryName?.toUpperCase() ||
//                         "";

//                     const qty = Number(item.quantity || 0);

//                     const pcsInSet = Number(item.pcsInSet || 1);

//                     const price = Number(item.singlePicPrice || 0);

//                     if (!qty || !price) return;

//                     const totalPcs = qty * pcsInSet;

//                     const totalAmount = totalPcs * price;

//                     if (category.includes("JEANS")) {
//                         if (isCurrent) {
//                             buckets.jeans.current.total += totalAmount;
//                             buckets.jeans.current.pieces += totalPcs;
//                         }

//                         if (isLast) {
//                             buckets.jeans.last.total += totalAmount;
//                         }

//                         hasJeans = true;
//                     }

//                     if (category.includes("SHIRT")) {
//                         if (isCurrent) {
//                             buckets.shirts.current.total += totalAmount;
//                             buckets.shirts.current.pieces += totalPcs;
//                         }

//                         if (isLast) {
//                             buckets.shirts.last.total += totalAmount;
//                         }

//                         hasShirts = true;
//                     }
//                 });

//                 if (isCurrent && hasJeans) {
//                     buckets.jeans.current.orders++;
//                 }

//                 if (isCurrent && hasShirts) {
//                     buckets.shirts.current.orders++;
//                 }
//             });

//             const result = {
//                 success: true,
//                 data: {
//                     jeans: {
//                         ...buckets.jeans.current,
//                         growth: Number(
//                             calcGrowth(
//                                 buckets.jeans.current.total,
//                                 buckets.jeans.last.total
//                             ).toFixed(2)
//                         ),
//                     },

//                     shirts: {
//                         ...buckets.shirts.current,
//                         growth: Number(
//                             calcGrowth(
//                                 buckets.shirts.current.total,
//                                 buckets.shirts.last.total
//                             ).toFixed(2)
//                         ),
//                     },

//                     totalOrder: orders.length,
//                 },
//             };
//             console.log("result=>1", result)
//             setSalesCache(cacheKey, result);

//             return res.status(200).json(result);
//         } catch (err) {
//             next(new ErrorHandler(err.message, 500));
//         }
//     }
// );

// // ───────────────── GET SALES DATA ─────────────────
// exports.getSalesData = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { range, startDate, endDate } = req.query;

//         const cacheKey = `salesData_${range}_${startDate}_${endDate}`;

//         const cached = getSalesCache(cacheKey);

//         if (cached) {
//             return res.status(200).json(cached);
//         }

//         const { start, end } = getDateRange(
//             range,
//             startDate,
//             endDate
//         );

//         const diff = end - start;

//         const lastStart = new Date(start.getTime() - diff);
//         const lastEnd = new Date(start.getTime() - 1);

//         const orders = await fetchOrders(start, end, lastStart);
//         // console.log('orders==>', orders)
//          return res.status(200).json(orders);

//         const buckets = {
//             jeans: {
//                 current: {
//                     total: 0,
//                     orders: 0,
//                     pieces: 0,
//                     dailyData: [],
//                 },

//                 last: {
//                     total: 0,
//                 },
//             },

//             shirts: {
//                 current: {
//                     total: 0,
//                     orders: 0,
//                     pieces: 0,
//                     dailyData: [],
//                 },

//                 last: {
//                     total: 0,
//                 },
//             },
//         };

//         orders.forEach((order) => {
//             const isCurrent =
//                 order.createdAt >= start &&
//                 order.createdAt <= end;

//             const isLast =
//                 order.createdAt >= lastStart &&
//                 order.createdAt <= lastEnd;

//             let hasJeans = false;
//             let hasShirts = false;

//             order.items.forEach((item) => {
//                 const category =
//                     item?.productId?.mainCategoryId?.mainCategoryName?.toUpperCase() ||
//                     "";

//                 const key = category.includes("JEANS")
//                     ? "jeans"
//                     : category.includes("SHIRT")
//                         ? "shirts"
//                         : null;

//                 if (!key) return;

//                 const qty = Number(item.quantity || 0);

//                 const pcsInSet = Number(item.pcsInSet || 1);

//                 const price = Number(item.singlePicPrice || 0);

//                 const totalPcs = qty * pcsInSet;

//                 const totalAmount = totalPcs * price;

//                 if (isCurrent) {
//                     buckets[key].current.total += totalAmount;

//                     buckets[key].current.pieces += totalPcs;

//                     const dateKey = getDateKey(order.createdAt);

//                     let daily =
//                         buckets[key].current.dailyData.find(
//                             (d) => d.date === dateKey
//                         );

//                     if (!daily) {
//                         daily = {
//                             date: dateKey,
//                             sales: 0,
//                             pieces: 0,
//                             orders: 0,
//                         };

//                         buckets[key].current.dailyData.push(
//                             daily
//                         );
//                     }

//                     daily.sales += totalAmount;
//                     daily.pieces += totalPcs;
//                     daily.orders += 1;
//                 }

//                 if (isLast) {
//                     buckets[key].last.total += totalAmount;
//                 }

//                 if (key === "jeans") hasJeans = true;
//                 if (key === "shirts") hasShirts = true;
//             });

//             if (isCurrent && hasJeans) {
//                 buckets.jeans.current.orders++;
//             }

//             if (isCurrent && hasShirts) {
//                 buckets.shirts.current.orders++;
//             }
//         });

//         const response = {};

//         Object.keys(buckets).forEach((key) => {
//             const data = buckets[key];

//             response[key] = {
//                 total: data.current.total,

//                 orders: data.current.orders,

//                 pieces: data.current.pieces,

//                 growth: Number(
//                     calcGrowth(
//                         data.current.total,
//                         data.last.total
//                     ).toFixed(2)
//                 ),

//                 dailyData: data.current.dailyData.sort(
//                     (a, b) =>
//                         new Date(a.date) - new Date(b.date)
//                 ),

//                 avgOrder: data.current.orders
//                     ? Math.round(
//                         data.current.total /
//                         data.current.orders
//                     )
//                     : 0,
//             };
//         });

//         const result = {
//             success: true,
//             data: response,
//         };
//         console.log("result=>2", result)
//         setSalesCache(cacheKey, result);

//         return res.status(200).json(result);
//     } catch (err) {
//         next(new ErrorHandler(err.message, 500));
//     }
// });

// // ───────────────── GET TOP PRODUCTS ─────────────────
// exports.getTopProducts = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { range, startDate, endDate } = req.query;

//         const cacheKey = `topProducts_${range}`;

//         const cached = getSalesCache(cacheKey);

//         if (cached) {
//             return res.status(200).json(cached);
//         }

//         const { start, end } = getDateRange(
//             range,
//             startDate,
//             endDate
//         );

//         const diff = end - start;

//         const lastStart = new Date(start.getTime() - diff);
//         const lastEnd = new Date(start.getTime() - 1);

//         const orders = await AdminOrder.find({
//             status: { $ne: "Cancelled" },
//             recycleBin: { $ne: true },
//             createdAt: {
//                 $gte: lastStart,
//                 $lte: end,
//             },
//         })
//             .select("items createdAt")
//             .populate({
//                 path: "items.productId",
//                 select: "name",
//             })
//             .lean();

//         const productMap = {};

//         orders.forEach((order) => {
//             const isCurrent =
//                 order.createdAt >= start &&
//                 order.createdAt <= end;

//             const isLast =
//                 order.createdAt >= lastStart &&
//                 order.createdAt <= lastEnd;

//             order.items.forEach((item) => {
//                 const name =
//                     item?.productId?.name ||
//                     item?.color ||
//                     "Unknown Product";

//                 const qty = Number(item.quantity || 0);

//                 const pcsInSet = Number(item.pcsInSet || 1);

//                 const price = Number(item.singlePicPrice || 0);

//                 const lineSales = qty * pcsInSet * price;

//                 const pieces = qty * pcsInSet;

//                 if (!productMap[name]) {
//                     productMap[name] = {
//                         name,

//                         current: {
//                             sales: 0,
//                             pieces: 0,
//                             units: 0,
//                         },

//                         last: {
//                             sales: 0,
//                         },
//                     };
//                 }

//                 if (isCurrent) {
//                     productMap[name].current.sales += lineSales;

//                     productMap[name].current.pieces += pieces;

//                     productMap[name].current.units += qty;
//                 }

//                 if (isLast) {
//                     productMap[name].last.sales += lineSales;
//                 }
//             });
//         });

//         const products = Object.values(productMap)
//             .map((p) => ({
//                 name: p.name,

//                 sales: p.current.sales,

//                 pieces: p.current.pieces,

//                 units: p.current.units,

//                 growth: Number(
//                     calcGrowth(
//                         p.current.sales,
//                         p.last.sales
//                     ).toFixed(2)
//                 ),
//             }))
//             .sort((a, b) => b.sales - a.sales);

//         const result = {
//             success: true,
//             data: products.slice(0, 10),
//         };
//         console.log("result=>3", result)
//         setSalesCache(cacheKey, result);

//         return res.status(200).json(result);
//     } catch (err) {
//         next(new ErrorHandler(err.message, 500));
//     }
// });



const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const ErrorHandler = require("../../utils/ErrorHandler");
const { AdminOrder } = require("../orders/orders-model");

// ───────────────── CACHE ─────────────────
const salesCache = {};
const SALES_TTL = 0.2 * 60 * 1000;

const getSalesCache = (key) => {
    const entry = salesCache[key];
    if (!entry) return null;
    if (Date.now() - entry.time > SALES_TTL) {
        delete salesCache[key];
        return null;
    }
    return entry.data;
};

const setSalesCache = (key, data) => {
    salesCache[key] = { data, time: Date.now() };
};

// ───────────────── POPULATE ─────────────────
// items.productId  →  SubProduct
// SubProduct.productId  →  Product
// Product.mainCategoryId  →  MainCategory
const salesPopulate = {
    path: "items.productId",
    model: "SubProduct",
    select: "productId singlePicPrice pcsInSet quantity color",
    populate: {
        path: "productId",
        model: "Product",
        select: "mainCategoryId",
        populate: {
            path: "mainCategoryId",
            model: "MainCategory",
            select: "mainCategoryName",
        },
    },
};

// ───────────────── HELPERS ─────────────────
const calcGrowth = (curr, prev) => {
    if (prev === 0) return curr === 0 ? 0 : 100;
    return ((curr - prev) / prev) * 100;
};

const getDateKey = (date) => new Date(date).toISOString().split("T")[0];

// FIX: avoid mutating `now` — always create fresh Date objects
const getDateRange = (range, startDate, endDate) => {
    const now = new Date();
    let start, end;

    switch (range) {
        case "Daily":
        case "today":
            start = new Date(now);
            start.setHours(0, 0, 0, 0);
            end = new Date(now);
            end.setHours(23, 59, 59, 999);
            break;

        case "Weekly":
        case "thisWeek":
            start = new Date(now);
            start.setDate(now.getDate() - now.getDay());
            start.setHours(0, 0, 0, 0);
            end = new Date(now);
            end.setHours(23, 59, 59, 999);
            break;

        case "Monthly":
        case "thisMonth":
            start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;

        case "Yearly":
        case "thisYear":
            start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
            end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;

        case "custom":
            // Normalize custom dates to start/end of day
            start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
            start.setHours(0, 0, 0, 0);

            end = endDate ? new Date(endDate) : new Date(now);
            end.setHours(23, 59, 59, 999);

            // Safety check: if user picks end date BEFORE start date, swap them
            if (start > end) {
                const temp = start;
                start = end;
                start.setHours(0, 0, 0, 0); // Ensure swapped start is 00:00
                end = temp;
                end.setHours(23, 59, 59, 999); // Ensure swapped end is 23:59
            }
            break;

        default:
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now);
    }

    return { start, end };
};

// ───────────────── COMMON ORDER FETCH ─────────────────
const fetchOrders = async (start, end, lastStart) => {
    return await AdminOrder.find({
        status: { $ne: "Cancelled" },
        recycleBin: { $ne: true },
        createdAt: { $gte: lastStart, $lte: end },
    })
        .select("items createdAt")
        .populate(salesPopulate)
        .lean();
};

// ───────────────── CATEGORY HELPER ─────────────────
// Your actual data shape after populate:
//   item.productId          → SubProduct doc
//   item.productId.productId → Product doc
//   item.productId.productId.mainCategoryId → MainCategory doc
const getCategory = (item) =>
    item?.productId?.productId?.mainCategoryId?.mainCategoryName?.toUpperCase() || "";

// ───────────────── GET REVENUE ─────────────────
exports.getJeansShirtRevenueAndOrder = catchAsyncErrors(async (req, res, next) => {
    try {
        const { range, startDate, endDate } = req.query;

        const cacheKey = `revenue_${range}_${startDate}_${endDate}`;
        const cached = getSalesCache(cacheKey);
        if (cached) return res.status(200).json(cached);

        const { start, end } = getDateRange(range, startDate, endDate);
        const diff = end - start;
        const lastStart = new Date(start.getTime() - diff);
        const lastEnd = new Date(start.getTime() - 1);

        const orders = await fetchOrders(start, end, lastStart);

        const buckets = {
            jeans: { current: { total: 0, pieces: 0, orders: 0 }, last: { total: 0 } },
            shirts: { current: { total: 0, pieces: 0, orders: 0 }, last: { total: 0 } },
        };

        orders.forEach((order) => {
            const isCurrent = order.createdAt >= start && order.createdAt <= end;
            const isLast = order.createdAt >= lastStart && order.createdAt <= lastEnd;

            let hasJeans = false;
            let hasShirts = false;

            order.items.forEach((item) => {
                const category = getCategory(item);

                // Pull price/qty from the order item line (overrides sub-product defaults)
                const qty = Number(item.quantity || 0);
                const pcsInSet = Number(item.pcsInSet || item.productId?.pcsInSet || 1);
                const price = Number(item.singlePicPrice || item.productId?.singlePicPrice || 0);

                if (!qty || !price) return;

                const totalPcs = qty * pcsInSet;
                const totalAmount = totalPcs * price;

                if (category.includes("JEANS")) {
                    if (isCurrent) {
                        buckets.jeans.current.total += totalAmount;
                        buckets.jeans.current.pieces += totalPcs;
                    }
                    if (isLast) buckets.jeans.last.total += totalAmount;
                    hasJeans = true;
                }

                if (category.includes("SHIRT")) {
                    if (isCurrent) {
                        buckets.shirts.current.total += totalAmount;
                        buckets.shirts.current.pieces += totalPcs;
                    }
                    if (isLast) buckets.shirts.last.total += totalAmount;
                    hasShirts = true;
                }
            });

            if (isCurrent && hasJeans) buckets.jeans.current.orders++;
            if (isCurrent && hasShirts) buckets.shirts.current.orders++;
        });

        const result = {
            success: true,
            data: {
                jeans: {
                    ...buckets.jeans.current,
                    growth: Number(calcGrowth(buckets.jeans.current.total, buckets.jeans.last.total).toFixed(2)),
                },
                shirts: {
                    ...buckets.shirts.current,
                    growth: Number(calcGrowth(buckets.shirts.current.total, buckets.shirts.last.total).toFixed(2)),
                },
                totalOrder: orders.length,
            },
        };

        setSalesCache(cacheKey, result);
        return res.status(200).json(result);
    } catch (err) {
        next(new ErrorHandler(err.message, 500));
    }
});

// ───────────────── GET SALES DATA ─────────────────
exports.getSalesData = catchAsyncErrors(async (req, res, next) => {
    try {
        const { range, startDate, endDate } = req.query;

        const cacheKey = `salesData_${range}_${startDate}_${endDate}`;
        const cached = getSalesCache(cacheKey);
        if (cached) return res.status(200).json(cached);

        const { start, end } = getDateRange(range, startDate, endDate);
        const diff = end - start;
        const lastStart = new Date(start.getTime() - diff);
        const lastEnd = new Date(start.getTime() - 1);

        const orders = await fetchOrders(start, end, lastStart);

        const buckets = {
            jeans: { current: { total: 0, orders: 0, pieces: 0, dailyData: [] }, last: { total: 0 } },
            shirts: { current: { total: 0, orders: 0, pieces: 0, dailyData: [] }, last: { total: 0 } },
        };

        orders.forEach((order) => {
            const isCurrent = order.createdAt >= start && order.createdAt <= end;
            const isLast = order.createdAt >= lastStart && order.createdAt <= lastEnd;

            let hasJeans = false;
            let hasShirts = false;

            order.items.forEach((item) => {
                const category = getCategory(item);
                const key =
                    category.includes("JEANS") ? "jeans" :
                        category.includes("SHIRT") ? "shirts" : null;

                if (!key) return;

                const qty = Number(item.quantity || 0);
                const pcsInSet = Number(item.pcsInSet || item.productId?.pcsInSet || 1);
                const price = Number(item.singlePicPrice || item.productId?.singlePicPrice || 0);

                if (!qty || !price) return;

                const totalPcs = qty * pcsInSet;
                const totalAmount = totalPcs * price;

                if (isCurrent) {
                    buckets[key].current.total += totalAmount;
                    buckets[key].current.pieces += totalPcs;

                    const dateKey = getDateKey(order.createdAt);
                    let daily = buckets[key].current.dailyData.find((d) => d.date === dateKey);
                    if (!daily) {
                        daily = { date: dateKey, sales: 0, pieces: 0, orders: 0 };
                        buckets[key].current.dailyData.push(daily);
                    }
                    daily.sales += totalAmount;
                    daily.pieces += totalPcs;
                    // Note: order-level count handled below; item-level +1 would double-count
                }

                if (isLast) buckets[key].last.total += totalAmount;

                if (key === "jeans") hasJeans = true;
                if (key === "shirts") hasShirts = true;
            });

            // Count each order once per category
            if (isCurrent && hasJeans) {
                buckets.jeans.current.orders++;
                const dateKey = getDateKey(order.createdAt);
                const daily = buckets.jeans.current.dailyData.find((d) => d.date === dateKey);
                if (daily) daily.orders++;
            }
            if (isCurrent && hasShirts) {
                buckets.shirts.current.orders++;
                const dateKey = getDateKey(order.createdAt);
                const daily = buckets.shirts.current.dailyData.find((d) => d.date === dateKey);
                if (daily) daily.orders++;
            }
        });

        const response = {};
        Object.keys(buckets).forEach((key) => {
            const data = buckets[key];
            response[key] = {
                total: data.current.total,
                orders: data.current.orders,
                pieces: data.current.pieces,
                growth: Number(calcGrowth(data.current.total, data.last.total).toFixed(2)),
                dailyData: data.current.dailyData.sort((a, b) => new Date(a.date) - new Date(b.date)),
                avgOrder: data.current.orders
                    ? Math.round(data.current.total / data.current.orders)
                    : 0,
            };
        });

        const result = { success: true, data: response };
        setSalesCache(cacheKey, result);
        return res.status(200).json(result);
    } catch (err) {
        next(new ErrorHandler(err.message, 500));
    }
});

// ───────────────── GET TOP PRODUCTS ─────────────────
exports.getTopProducts = catchAsyncErrors(async (req, res, next) => {
    try {
        const { range, startDate, endDate } = req.query;

        const cacheKey = `topProducts_${range}_${startDate}_${endDate}`;
        const cached = getSalesCache(cacheKey);
        if (cached) return res.status(200).json(cached);

        const { start, end } = getDateRange(range, startDate, endDate);
        const diff = end - start;
        const lastStart = new Date(start.getTime() - diff);
        const lastEnd = new Date(start.getTime() - 1);

        // For top products we populate name from SubProduct directly
        const orders = await AdminOrder.find({
            status: { $ne: "Cancelled" },
            recycleBin: { $ne: true },
            createdAt: { $gte: lastStart, $lte: end },
        })
            .select("items createdAt")
            .populate({
                path: "items.productId",
                model: "SubProduct",
                select: "lotNumber color name",
            })
            .lean();

        const productMap = {};

        orders.forEach((order) => {
            const isCurrent = order.createdAt >= start && order.createdAt <= end;
            const isLast = order.createdAt >= lastStart && order.createdAt <= lastEnd;

            order.items.forEach((item) => {
                // Use lotNumber + color as a readable product identifier
                const subProduct = item?.productId;
                const name =
                    (subProduct?.lotNumber && subProduct?.color)
                        ? `${subProduct.lotNumber} - Color ${subProduct.color}`
                        : subProduct?.name || item?.color || "Unknown Product";

                const qty = Number(item.quantity || 0);
                const pcsInSet = Number(item.pcsInSet || subProduct?.pcsInSet || 1);
                const price = Number(item.singlePicPrice || subProduct?.singlePicPrice || 0);

                const lineSales = qty * pcsInSet * price;
                const pieces = qty * pcsInSet;

                if (!productMap[name]) {
                    productMap[name] = {
                        name,
                        current: { sales: 0, pieces: 0, units: 0 },
                        last: { sales: 0 },
                    };
                }

                if (isCurrent) {
                    productMap[name].current.sales += lineSales;
                    productMap[name].current.pieces += pieces;
                    productMap[name].current.units += qty;
                }
                if (isLast) {
                    productMap[name].last.sales += lineSales;
                }
            });
        });

        const products = Object.values(productMap)
            .map((p) => ({
                name: p.name,
                sales: p.current.sales,
                pieces: p.current.pieces,
                units: p.current.units,
                growth: Number(calcGrowth(p.current.sales, p.last.sales).toFixed(2)),
            }))
            .sort((a, b) => b.sales - a.sales);

        const result = { success: true, data: products.slice(0, 10) };
        setSalesCache(cacheKey, result);
        return res.status(200).json(result);
    } catch (err) {
        next(new ErrorHandler(err.message, 500));
    }
});