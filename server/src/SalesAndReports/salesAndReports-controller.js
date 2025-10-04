const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const ErrorHandler = require("../../utils/ErrorHandler");
const { AdminOrder } = require("../orders/orders-model")


exports.getJeansShirtRevenueAndOrder = catchAsyncErrors(async (req, res, next) => {
    try {
        const now = new Date();
        const { range, startDate, endDate } = req.query; // dynamic range

        let start, end;

        switch (range) {
            case "today":
                start = new Date(now.setHours(0, 0, 0, 0));
                end = new Date(now.setHours(23, 59, 59, 999));
                break;
            case "thisWeek":
                const firstDay = now.getDate() - now.getDay(); // Sunday
                start = new Date(now.setDate(firstDay));
                start.setHours(0, 0, 0, 0);
                end = new Date();
                break;
            case "thisMonth":
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                break;
            case "thisYear":
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                break;
            case "custom":
                start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
                end = endDate ? new Date(endDate) : new Date();
                break;
            default:
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        // Last period for growth calculation
        const lastStart = new Date(start);
        const lastEnd = new Date(start.getTime() - 1); // day before start
        const diff = end - start;
        const lastStartAdjusted = new Date(lastStart.getTime() - diff);
        const lastEndAdjusted = new Date(lastEnd.getTime());

        const orders = await AdminOrder.find({
            status: { $ne: "Cancelled" },
            createdAt: { $gte: lastStartAdjusted, $lte: end },
        })
            .populate({
                path: "items.productId",
                populate: {
                    path: "productId",
                    model: "Product",
                    populate: {
                        path: "mainCategoryId",
                        model: "MainCategory",
                    },
                },
            })
            .populate("customer.userId");

        const buckets = {
            jeans: { current: { total: 0, orders: 0, pieces: 0 }, last: { total: 0 } },
            shirts: { current: { total: 0, orders: 0, pieces: 0 }, last: { total: 0 } },
        };
        // console.log("DDDDDDDDDD:==>", orders[0])
        orders.forEach(order => {
            const isCurrent = order.createdAt >= start && order.createdAt <= end;
            const isLast = order.createdAt >= lastStartAdjusted && order.createdAt <= lastEndAdjusted;

            let hasJeans = false;
            let hasShirts = false;

            order.items.forEach(item => {
                const category = item?.productId?.productId?.mainCategoryId?.mainCategoryName || "";
                if (category.includes("JEANS")) {
                    if (isCurrent) {
                        buckets.jeans.current.total += parseInt(item.productId?.filnalLotPrice) * parseInt(item?.quantity)
                        buckets.jeans.current.pieces += parseInt(item?.quantity);
                    }
                    if (isLast) buckets.jeans.last.total += parseInt(item?.productId?.filnalLotPrice) * parseInt(item?.quantity);
                    hasJeans = true;
                } else if (category.includes("SHIRTS")) {
                    console.log("DDDD:==>GGGGG", item.singlePicPrice, item.pcsInSet, item?.quantity);
                    if (isCurrent) {
                        buckets.shirts.current.total += parseInt(item.singlePicPrice * item.pcsInSet) * parseInt(item?.quantity);
                        buckets.shirts.current.pieces += item.quantity;
                    }
                    if (isLast) buckets.shirts.last.total += parseInt(item.productId?.filnalLotPrice) * parseInt(item?.quantity);
                    hasShirts = true;
                }
            });

            if (hasJeans && isCurrent) buckets.jeans.current.orders += 1;
            if (hasShirts && isCurrent) buckets.shirts.current.orders += 1;
        });

        const calcGrowth = (curr, prev) => (prev === 0 ? (curr === 0 ? 0 : 100) : ((curr - prev) / prev) * 100);

        res.status(200).json({
            success: true,
            data: {
                jeans: { ...buckets.jeans.current, growth: calcGrowth(buckets.jeans.current.total, buckets.jeans.last.total).toFixed(2) },
                shirts: { ...buckets.shirts.current, growth: calcGrowth(buckets.shirts.current.total, buckets.shirts.last.total).toFixed(2) },
            },
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

// helpers
const calcGrowth = (curr, prev) =>
    prev === 0 ? (curr === 0 ? 0 : 100) : ((curr - prev) / prev) * 100;

const getDateKey = date => date.toISOString().split("T")[0];

exports.getSalesData = catchAsyncErrors(async (req, res, next) => {
    try {
        const now = new Date();
        const { range, startDate, endDate } = req.query;

        let start, end;
        switch (range) {
            case "Daily":
            case "today":
                start = new Date(now.setHours(0, 0, 0, 0));
                end = new Date(now.setHours(23, 59, 59, 999));
                break;
            case "Weekly":
            case "thisWeek":
                const day = now.getDay(); // Sunday = 0
                start = new Date(now);
                start.setDate(now.getDate() - day); // go back to Sunday
                start.setHours(0, 0, 0, 0);
                end = new Date();
                break;
            case "Monthly":
            case "thisMonth":
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                break;
            case "Yearly":
            case "thisYear":
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                break;
            case "custom":
                start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
                end = endDate ? new Date(endDate) : new Date();
                break;
            default:
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        // Previous period
        const diff = end.getTime() - start.getTime();
        const lastStart = new Date(start.getTime() - diff);
        const lastEnd = new Date(start.getTime() - 1);

        // Fetch orders (both periods together)
        const orders = await AdminOrder.find({
            status: { $ne: "Cancelled" },
            createdAt: { $gte: lastStart, $lte: end },
        })
            .populate({
                path: "items.productId",
                populate: {
                    path: "productId",
                    model: "Product",
                    populate: { path: "mainCategoryId", model: "MainCategory" },
                },
            })
            .populate("customer.userId");

        // Buckets
        const categories = ["JEANS", "SHIRTS"];
        const buckets = {};
        categories.forEach(cat => {
            buckets[cat.toLowerCase()] = {
                current: { total: 0, orders: 0, pieces: 0, dailyData: [] },
                last: { total: 0 },
            };
        });

        // Process orders
        orders.forEach(order => {
            const isCurrent = order.createdAt >= start && order.createdAt <= end;
            const isLast = order.createdAt >= lastStart && order.createdAt <= lastEnd;

            let orderHasJeans = false;
            let orderHasShirts = false;

            order.items.forEach(item => {
                const category = item?.productId?.productId?.mainCategoryId?.mainCategoryName || "";
                const key = category.toUpperCase().includes("JEANS")
                    ? "jeans"
                    : category.toUpperCase().includes("SHIRTS")
                        ? "shirts"
                        : null;

                if (!key) return;

                const lineTotal = parseInt(item?.productId?.filnalLotPrice || 0) * parseInt(item?.quantity || 0);

                if (isCurrent) {
                    buckets[key].current.total += lineTotal;
                    buckets[key].current.pieces += item?.quantity || 0;

                    // Daily data
                    const dateKey = getDateKey(order.createdAt);
                    const daily = buckets[key].current.dailyData.find(d => d.date === dateKey);
                    if (daily) {
                        daily.sales += lineTotal;
                        daily.pieces += item?.quantity || 0;
                    } else {
                        buckets[key].current.dailyData.push({
                            date: dateKey,
                            sales: lineTotal,
                            orders: 0, // filled later
                            pieces: item?.quantity || 0,
                        });
                    }
                }

                if (isLast) {
                    buckets[key].last.total += lineTotal;
                }

                if (key === "jeans") orderHasJeans = true;
                if (key === "shirts") orderHasShirts = true;
            });

            if (isCurrent && orderHasJeans) buckets.jeans.current.orders += 1;
            if (isCurrent && orderHasShirts) buckets.shirts.current.orders += 1;
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
                    : 0,
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
        }).populate("items.productId");

        const productMap = {};

        // Aggregate orders
        orders.forEach(order => {
            const isCurrent = order.createdAt >= start && order.createdAt <= end;
            const isLast = order.createdAt >= lastStart && order.createdAt <= lastEnd;

            order.items.forEach(item => {
                console.log("XXXXXXX:==>", item)
                const name = item?.name || item?.productId?.name || "Unknown Product";
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



