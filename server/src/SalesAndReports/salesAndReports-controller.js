const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const ErrorHandler = require("../../utils/ErrorHandler");
const { AdminOrder } = require("../orders/orders-model")


// exports.getJeansShirtRevenueAndOrder = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const now = new Date();
//         const { range, startDate, endDate } = req.query; // dynamic range

//         let start, end;

//         switch (range) {
//             case "today":
//                 start = new Date(now.setHours(0, 0, 0, 0));
//                 end = new Date(now.setHours(23, 59, 59, 999));
//                 break;
//             case "thisWeek":
//                 const firstDay = now.getDate() - now.getDay(); // Sunday
//                 start = new Date(now.setDate(firstDay));
//                 start.setHours(0, 0, 0, 0);
//                 end = new Date();
//                 break;
//             case "thisMonth":
//                 start = new Date(now.getFullYear(), now.getMonth(), 1);
//                 end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
//                 break;
//             case "thisYear":
//                 start = new Date(now.getFullYear(), 0, 1);
//                 end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
//                 break;
//             case "custom":
//                 start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
//                 end = endDate ? new Date(endDate) : new Date();
//                 break;
//             default:
//                 start = new Date(now.getFullYear(), now.getMonth(), 1);
//                 end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
//         }

//         // Last period for growth calculation
//         const lastStart = new Date(start);
//         const lastEnd = new Date(start.getTime() - 1); // day before start
//         const diff = end - start;
//         const lastStartAdjusted = new Date(lastStart.getTime() - diff);
//         const lastEndAdjusted = new Date(lastEnd.getTime());

//         const orders = await AdminOrder.find({
//             status: { $ne: "Cancelled" },
//             recycleBin: { $ne: true },
//             createdAt: { $gte: lastStartAdjusted, $lte: end },
//         })
//             .populate({
//                 path: "items.productId",
//                 populate: {
//                     path: "productId",
//                     model: "Product",
//                     populate: {
//                         path: "mainCategoryId",
//                         model: "MainCategory",
//                     },
//                 },
//             })
//             .populate("customer.userId");

//         const buckets = {
//             jeans: { current: { total: 0, orders: 0, pieces: 0 }, last: { total: 0 } },
//             shirts: { current: { total: 0, orders: 0, pieces: 0 }, last: { total: 0 } },
//         };
//         // console.log("DDDDDDDDDD:==>", orders[0])
//         orders.forEach(order => {
//             const isCurrent = order.createdAt >= start && order.createdAt <= end;
//             const isLast = order.createdAt >= lastStartAdjusted && order.createdAt <= lastEndAdjusted;

//             let hasJeans = false;
//             let hasShirts = false;

//             order.items.forEach(item => {
//                 const category = item?.productId?.productId?.mainCategoryId?.mainCategoryName || "";
//                 if (category.includes("JEANS")) {
//                     if (isCurrent) {
//                         buckets.jeans.current.total += parseInt(item.productId?.filnalLotPrice) * parseInt(item?.quantity)
//                         buckets.jeans.current.pieces += parseInt(item.pcsInSet) || parseInt(item?.quantity);
//                     }
//                     if (isLast) buckets.jeans.last.total += parseInt(item?.productId?.filnalLotPrice) * parseInt(item?.quantity);
//                     hasJeans = true;
//                 } else if (category.includes("SHIRTS")) {
//                     console.log("DDDD:==>GGGGG=>", item.singlePicPrice, item.pcsInSet, item?.quantity);
//                     if (isCurrent) {
//                         buckets.shirts.current.total += parseInt(item.singlePicPrice * item.pcsInSet) * parseInt(item?.quantity);
//                         buckets.shirts.current.pieces += parseInt(item.pcsInSet) || item.quantity;
//                     }
//                     if (isLast) buckets.shirts.last.total += parseInt(item.productId?.filnalLotPrice) * parseInt(item?.quantity);
//                     hasShirts = true;
//                 }
//             });

//             if (hasJeans && isCurrent) buckets.jeans.current.orders += 1;
//             if (hasShirts && isCurrent) buckets.shirts.current.orders += 1;
//         });

//         const calcGrowth = (curr, prev) => (prev === 0 ? (curr === 0 ? 0 : 100) : ((curr - prev) / prev) * 100);

//         res.status(200).json({
//             success: true,
//             data: {
//                 jeans: { ...buckets.jeans.current, growth: calcGrowth(buckets.jeans.current.total, buckets.jeans.last.total).toFixed(2) },
//                 shirts: { ...buckets.shirts.current, growth: calcGrowth(buckets.shirts.current.total, buckets.shirts.last.total).toFixed(2) },
//                 totalOrder: orders?.length || 0
//             },
//         });
//     } catch (err) {
//         return next(new ErrorHandler(err.message, 500));
//     }
// });

// helpers


exports.getJeansShirtRevenueAndOrder = catchAsyncErrors(async (req, res, next) => {
    try {
        const now = new Date();
        const { range, startDate, endDate } = req.query;

        let start, end;

        switch (range) {
            case "today":
                start = new Date(new Date().setHours(0,0,0,0));
                end = new Date(new Date().setHours(23,59,59,999));
                break;
            case "thisWeek":
                start = new Date(now);
                start.setDate(now.getDate() - now.getDay());
                start.setHours(0,0,0,0);
                end = new Date();
                break;
            case "thisMonth":
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth()+1, 0, 23,59,59,999);
                break;
            case "custom":
                start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
                end = endDate ? new Date(endDate) : new Date();
                break;
            default:
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date();
        }

        const diff = end - start;
        const lastStart = new Date(start.getTime() - diff);
        const lastEnd = new Date(start.getTime() - 1);

        const orders = await AdminOrder.find({
            status: { $ne: "Cancelled" },
            recycleBin: { $ne: true },
            createdAt: { $gte: lastStart, $lte: end },
        })
        .populate({
            path: "items.productId",
            populate: {
                path: "productId",
                model: "Product",
                populate: { path: "mainCategoryId", model: "MainCategory" }
            }
        })
        .lean();

        const buckets = {
            jeans: { current: { total: 0, pieces: 0, orders: 0 }, last: { total: 0 } },
            shirts: { current: { total: 0, pieces: 0, orders: 0 }, last: { total: 0 } },
        };

        orders.forEach(order => {
            const isCurrent = order.createdAt >= start && order.createdAt <= end;
            const isLast = order.createdAt >= lastStart && order.createdAt <= lastEnd;

            let hasJeans = false;
            let hasShirts = false;

            order.items.forEach(item => {
                const category = item?.productId?.productId?.mainCategoryId?.mainCategoryName?.toUpperCase() || "";

                const qty = Number(item.quantity || 0);
                const pcsInSet = Number(item.pcsInSet || 1);
                const price = Number(item.singlePicPrice || 0);

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

        const calcGrowth = (c, p) => (!p ? 0 : ((c - p) / p) * 100);

        res.status(200).json({
            success: true,
            data: {
                jeans: {
                    ...buckets.jeans.current,
                    growth: calcGrowth(buckets.jeans.current.total, buckets.jeans.last.total).toFixed(2)
                },
                shirts: {
                    ...buckets.shirts.current,
                    growth: calcGrowth(buckets.shirts.current.total, buckets.shirts.last.total).toFixed(2)
                },
                totalOrder: orders.length
            }
        });

    } catch (err) {
        next(new ErrorHandler(err.message, 500));
    }
});

const calcGrowth = (curr, prev) =>
    prev === 0 ? (curr === 0 ? 0 : 100) : ((curr - prev) / prev) * 100;

const getDateKey = date => new Date(date).toISOString().split("T")[0];

exports.getSalesData = catchAsyncErrors(async (req, res, next) => {
    try {
        const now = new Date();
        const { range, startDate, endDate } = req.query;

        let start, end;

        switch (range) {
            case "Daily":
            case "today":
                start = new Date(new Date().setHours(0,0,0,0));
                end = new Date(new Date().setHours(23,59,59,999));
                break;

            case "Weekly":
            case "thisWeek":
                start = new Date(now);
                start.setDate(now.getDate() - now.getDay());
                start.setHours(0,0,0,0);
                end = new Date();
                break;

            case "Monthly":
            case "thisMonth":
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth()+1, 0, 23,59,59,999);
                break;

            case "Yearly":
            case "thisYear":
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31, 23,59,59,999);
                break;

            case "custom":
                start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
                end = endDate ? new Date(endDate) : new Date();
                break;

            default:
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date();
        }

        // Previous period
        const diff = end - start;
        const lastStart = new Date(start.getTime() - diff);
        const lastEnd = new Date(start.getTime() - 1);

        const orders = await AdminOrder.find({
            status: { $ne: "Cancelled" },
            recycleBin: { $ne: true },
            createdAt: { $gte: lastStart, $lte: end },
        })
        .populate({
            path: "items.productId",
            populate: {
                path: "productId",
                model: "Product",
                populate: { path: "mainCategoryId", model: "MainCategory" }
            }
        })
        .lean(); // 🔥 performance boost

        const buckets = {
            jeans: { current: { total: 0, orders: 0, pieces: 0, dailyData: [] }, last: { total: 0 } },
            shirts: { current: { total: 0, orders: 0, pieces: 0, dailyData: [] }, last: { total: 0 } }
        };

        orders.forEach(order => {
            const isCurrent = order.createdAt >= start && order.createdAt <= end;
            const isLast = order.createdAt >= lastStart && order.createdAt <= lastEnd;

            let hasJeans = false;
            let hasShirts = false;

            order.items.forEach(item => {
                const category = item?.productId?.productId?.mainCategoryId?.mainCategoryName?.toUpperCase() || "";

                const key =
                    category.includes("JEANS") ? "jeans" :
                    category.includes("SHIRT") ? "shirts" :
                    null;

                if (!key) return;

                const qty = Number(item.quantity || 0);
                const pcsInSet = Number(item.pcsInSet || 1);
                const price = Number(item.singlePicPrice || 0);

                if (!qty || !price) return;

                const totalPcs = qty * pcsInSet;
                const totalAmount = totalPcs * price;

                if (isCurrent) {
                    buckets[key].current.total += totalAmount;
                    buckets[key].current.pieces += totalPcs;

                    const dateKey = getDateKey(order.createdAt);

                    let daily = buckets[key].current.dailyData.find(d => d.date === dateKey);

                    if (!daily) {
                        daily = { date: dateKey, sales: 0, pieces: 0, orders: 0 };
                        buckets[key].current.dailyData.push(daily);
                    }

                    daily.sales += totalAmount;
                    daily.pieces += totalPcs;
                }

                if (isLast) {
                    buckets[key].last.total += totalAmount;
                }

                if (key === "jeans") hasJeans = true;
                if (key === "shirts") hasShirts = true;
            });

            if (isCurrent && hasJeans) buckets.jeans.current.orders++;
            if (isCurrent && hasShirts) buckets.shirts.current.orders++;
        });

        // Final response
        const response = {};

        Object.keys(buckets).forEach(key => {
            const data = buckets[key];

            response[key] = {
                total: data.current.total,
                orders: data.current.orders,
                pieces: data.current.pieces,
                growth: calcGrowth(data.current.total, data.last.total).toFixed(2),
                dailyData: data.current.dailyData.sort((a, b) => new Date(a.date) - new Date(b.date)),
                avgOrder: data.current.orders
                    ? Math.round(data.current.total / data.current.orders)
                    : 0
            };
        });

        res.status(200).json({ success: true, data: response });

    } catch (err) {
        next(new ErrorHandler(err.message, 500));
    }
});

exports.getTopProducts = async (req, res, next) => {
    try {
        const now = new Date();
        const { range } = req.query;

        // Current period (thisMonth default)
        let start = new Date(now.getFullYear(), now.getMonth(), 1);
        let end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        if (range === "today") {
            start = new Date(now.setHours(0, 0, 0, 0));
            end = new Date(now.setHours(23, 59, 59, 999));
        } else if (range === "thisWeek") {
            const day = now.getDay();
            start = new Date(now);
            start.setDate(now.getDate() - day);
            start.setHours(0, 0, 0, 0);
            end = new Date();
        }

        const diff = end.getTime() - start.getTime();
        const lastStart = new Date(start.getTime() - diff);
        const lastEnd = new Date(start.getTime() - 1);

        // Fetch orders
        const orders = await AdminOrder.find({
            createdAt: { $gte: lastStart, $lte: end },
            status: { $ne: "Cancelled" },
            recycleBin: { $ne: true },
        }).populate("items.productId");

        const productMap = {};

        // Aggregate orders
        orders.forEach(order => {
            const isCurrent = order.createdAt >= start && order.createdAt <= end;
            const isLast = order.createdAt >= lastStart && order.createdAt <= lastEnd;

            order.items.forEach(item => {
                console.log("XXXXXXX:==>", item)
                const name = item?.color || item?.productId?.name || "Unknown Product";
                const lineSales = (item.singlePicPrice || 0) * (item?.pcsInSet || 1) * (item?.quantity || 0);
                const pieces = (item?.pcsInSet || 1) * (item?.quantity || 0);

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
                    productMap[name].current.units += item.quantity || 0;
                }

                if (isLast) {
                    productMap[name].last.sales += lineSales;
                }
            });
        });

        // Build final list
        let products = Object.values(productMap).map(p => ({
            name: p.name,
            sales: p.current.sales,
            pieces: p.current.pieces,
            units: p.current.units,
            growth: parseFloat(calcGrowth(p.current.sales, p.last.sales).toFixed(2)),
        }));

        // Sort top products by sales
        products.sort((a, b) => b.sales - a.sales);

        res.status(200).json({ success: true, data: products.slice(0, 10) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};


// exports.getTopProducts = async (req, res) => {
//     try {
//         const now = new Date();
//         let start = new Date(now.getFullYear(), now.getMonth(), 1);
//         let end = new Date();

//         const diff = end - start;
//         const lastStart = new Date(start.getTime() - diff);
//         const lastEnd = new Date(start.getTime() - 1);

//         const orders = await AdminOrder.find({
//             createdAt: { $gte: lastStart, $lte: end },
//             status: { $ne: "Cancelled" },
//             recycleBin: { $ne: true },
//         })
//         .populate("items.productId")
//         .lean();

//         const map = {};

//         orders.forEach(order => {
//             const isCurrent = order.createdAt >= start && order.createdAt <= end;
//             const isLast = order.createdAt >= lastStart && order.createdAt <= lastEnd;

//             order.items.forEach(item => {
//                 const name = item?.productId?.productId?.productName || "Unknown";

//                 const qty = Number(item.quantity || 0);
//                 const pcsInSet = Number(item.pcsInSet || 1);
//                 const price = Number(item.singlePicPrice || 0);

//                 if (!qty || !price) return;

//                 const totalPcs = qty * pcsInSet;
//                 const totalAmount = totalPcs * price;

//                 if (!map[name]) {
//                     map[name] = { name, current: { sales: 0 }, last: { sales: 0 } };
//                 }

//                 if (isCurrent) map[name].current.sales += totalAmount;
//                 if (isLast) map[name].last.sales += totalAmount;
//             });
//         });

//         const calcGrowth = (c, p) => (!p ? 0 : ((c - p) / p) * 100);

//         const result = Object.values(map)
//             .map(p => ({
//                 name: p.name,
//                 sales: p.current.sales,
//                 growth: calcGrowth(p.current.sales, p.last.sales).toFixed(2)
//             }))
//             .sort((a, b) => b.sales - a.sales)
//             .slice(0, 10);

//         res.status(200).json({ success: true, data: result });

//     } catch (err) {
//         res.status(500).json({ success: false, message: err.message });
//     }
// };

