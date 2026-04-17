const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const Card = require("../addToCard/card-model");
const { AdminOrder } = require("../orders/orders-model");
const User = require("../users/users-model");

// ─── Simple in-memory cache ────────────────────────────────────────────────────
const cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const getCache = (key) => {
    const entry = cache[key];
    if (!entry) return null;
    if (Date.now() - entry.time > CACHE_TTL) { delete cache[key]; return null; }
    return entry.data;
};
const setCache = (key, data) => { cache[key] = { data, time: Date.now() }; };

// ─── Shared populate config ────────────────────────────────────────────────────
const orderPopulate = {
    path: "items.productId",
    select: "productId singlePicPrice pcsInSet quantity",
    populate: {
        path: "productId",
        model: "Product",
        select: "mainCategoryId",
        populate: { path: "mainCategoryId", model: "MainCategory", select: "mainCategoryName" }
    }
};

// ─── getDashboardData ──────────────────────────────────────────────────────────
exports.getDashboardData = catchAsyncErrors(async (req, res) => {
    try {
        const cacheKey = `dashboard_${req.query.start}_${req.query.end}`;
        const cached = getCache(cacheKey);
        if (cached) return res.status(200).json(cached);

        const start = req.query.start ? new Date(req.query.start) : new Date("2000-01-01");
        const end = req.query.end ? new Date(req.query.end) : new Date();

        const lastStart = new Date(start);
        lastStart.setMonth(start.getMonth() - 1);

        const lastEnd = new Date(end);
        lastEnd.setMonth(end.getMonth() - 1);

        const orders = await AdminOrder.find({ recycleBin: { $ne: true } })
            .select("items createdAt status")
            .populate(orderPopulate)
            .lean();

        const buckets = {
            jeans: { current: { total: 0, pieces: 0, orders: 0 }, last: { total: 0 } },
            shirts: { current: { total: 0, pieces: 0, orders: 0 }, last: { total: 0 } },
            global: { totalSales: 0, pcs: 0, orders: 0 }
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
                const pricePerPiece = Number(item.singlePicPrice || 0);
                if (!qty || !pricePerPiece) return;
                const totalPcs = qty * pcsInSet;
                const totalAmount = totalPcs * pricePerPiece;

                if (category.includes("JEANS")) {
                    if (isCurrent) { buckets.jeans.current.total += totalAmount; buckets.jeans.current.pieces += totalPcs; buckets.global.totalSales += totalAmount; buckets.global.pcs += totalPcs; }
                    if (isLast) buckets.jeans.last.total += totalAmount;
                    hasJeans = true;
                } else if (category.includes("SHIRT")) {
                    if (isCurrent) { buckets.shirts.current.total += totalAmount; buckets.shirts.current.pieces += totalPcs; buckets.global.totalSales += totalAmount; buckets.global.pcs += totalPcs; }
                    if (isLast) buckets.shirts.last.total += totalAmount;
                    hasShirts = true;
                }
            });

            if (isCurrent) {
                if (hasJeans) buckets.jeans.current.orders++;
                if (hasShirts) buckets.shirts.current.orders++;
                buckets.global.orders++;
            }
        });

        const getGrowth = (current, last) => {
            if (!last) return "0%";
            return (((current - last) / last) * 100).toFixed(1) + "%";
        };

        const stats = [
            { title: "Total Sales", value: `₹${buckets.global.totalSales} | ${buckets.global.pcs} Pcs`, change: getGrowth(buckets.global.totalSales, buckets.jeans.last.total + buckets.shirts.last.total), changeType: "positive", icon: "ri-money-dollar-circle-line", color: "blue" },
            { title: "Jeans Sales", value: `₹${buckets.jeans.current.total} | ${buckets.jeans.current.pieces} Pcs`, change: getGrowth(buckets.jeans.current.total, buckets.jeans.last.total), changeType: "positive", icon: "ri-shirt-line", color: "blue" },
            { title: "Shirts Sales", value: `₹${buckets.shirts.current.total} | ${buckets.shirts.current.pieces} Pcs`, change: getGrowth(buckets.shirts.current.total, buckets.shirts.last.total), changeType: "positive", icon: "ri-t-shirt-line", color: "green" },
            { title: "Orders", value: `${buckets.global.orders}`, change: "0%", changeType: "positive", icon: "ri-shopping-cart-line", color: "purple" }
        ];

        const result = { success: true, stats };
        setCache(cacheKey, result);
        return res.status(200).json(result);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ─── getCategoryComparisons ────────────────────────────────────────────────────
exports.getCategoryComparisons = catchAsyncErrors(async (req, res) => {
    try {
        const cached = getCache('categoryComparisons');
        if (cached) return res.status(200).json(cached);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - 1);
        const lastMonthStart = new Date();
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 2);
        const ytdStart = new Date(today.getFullYear(), 0, 1);

        const orders = await AdminOrder.find({ recycleBin: { $ne: true } })
            .select("items createdAt")
            .populate(orderPopulate)
            .lean();

        const createBucket = () => ({
            todaySales: 0, todayPcs: 0,
            weeklySales: 0, weeklyPcs: 0,
            monthlySales: 0, monthlyPcs: 0,
            ytdSales: 0, ytdPcs: 0,
            lastMonthSales: 0
        });

        const buckets = { jeans: createBucket(), shirts: createBucket() };

        orders.forEach(order => {
            const created = new Date(order.createdAt);
            order.items.forEach(item => {
                const category = item?.productId?.productId?.mainCategoryId?.mainCategoryName?.toUpperCase() || "";
                const qty = Number(item.quantity || 0);
                const pcsInSet = Number(item.pcsInSet || 1);
                const pricePerPiece = Number(item.singlePicPrice || 0);
                if (!qty || !pricePerPiece) return;
                const totalPcs = qty * pcsInSet;
                const totalAmount = totalPcs * pricePerPiece;
                const bucket = category.includes("JEANS") ? buckets.jeans : category.includes("SHIRT") ? buckets.shirts : null;
                if (!bucket) return;
                if (created >= today) { bucket.todaySales += totalAmount; bucket.todayPcs += totalPcs; }
                if (created >= weekStart) { bucket.weeklySales += totalAmount; bucket.weeklyPcs += totalPcs; }
                if (created >= monthStart) { bucket.monthlySales += totalAmount; bucket.monthlyPcs += totalPcs; }
                if (created >= lastMonthStart && created < monthStart) { bucket.lastMonthSales += totalAmount; }
                if (created >= ytdStart) { bucket.ytdSales += totalAmount; bucket.ytdPcs += totalPcs; }
            });
        });

        const calcGrowth = (current, last) => {
            if (!last) return "0%";
            return (((current - last) / last) * 100).toFixed(1) + "%";
        };

        const data = {
            jeans: { ...buckets.jeans, growth: calcGrowth(buckets.jeans.monthlySales, buckets.jeans.lastMonthSales) },
            shirts: { ...buckets.shirts, growth: calcGrowth(buckets.shirts.monthlySales, buckets.shirts.lastMonthSales) }
        };

        const result = { success: true, categoryComparison: data };
        setCache('categoryComparisons', result);
        return res.status(200).json(result);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ─── getSalesChartData ─────────────────────────────────────────────────────────
exports.getSalesChartData = catchAsyncErrors(async (req, res) => {
    try {
        const dateRange = req.query.dateRange || "Monthly";
        const cached = getCache(`salesChart_${dateRange}`);
        if (cached) return res.status(200).json(cached);

        const orders = await AdminOrder.find({ recycleBin: { $ne: true } })
            .select("items createdAt")
            .populate({
                path: "items.productId",
                select: "singlePicPrice pcsInSet quantity",
            })
            .lean();

        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const monthlyData = months.map(m => ({ month: m, sales: 0 }));
        const weeklyData = Array.from({ length: 4 }, (_, i) => ({ week: i + 1, sales: 0 }));
        const dailyData = Array.from({ length: 31 }, (_, i) => ({ day: i + 1, sales: 0 }));

        orders.forEach(order => {
            const date = new Date(order.createdAt);
            const monthIndex = date.getMonth();
            const weekIndex = Math.min(3, Math.floor((date.getDate() - 1) / 7));
            const dayIndex = date.getDate() - 1;

            order.items.forEach(item => {
                const qty = Number(item.quantity || 0);
                const pcsInSet = Number(item.pcsInSet || 1);
                const price = Number(item.singlePicPrice || 0);
                if (!qty || !price) return;
                const total = qty * pcsInSet * price;
                monthlyData[monthIndex].sales += total;
                if (weeklyData[weekIndex]) weeklyData[weekIndex].sales += total;
                if (dailyData[dayIndex]) dailyData[dayIndex].sales += total;
            });
        });

        const salesData = dateRange === "Weekly" ? weeklyData : dateRange === "Daily" ? dailyData : monthlyData;
        const result = { success: true, salesData };
        setCache(`salesChart_${dateRange}`, result);
        return res.status(200).json(result);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ─── getOrderStatusChartData ───────────────────────────────────────────────────
exports.getOrderStatusChartData = catchAsyncErrors(async (req, res) => {
    try {
        const cached = getCache('orderStatus');
        if (cached) return res.status(200).json(cached);

        const orders = await AdminOrder.find({ recycleBin: { $ne: true } })
            .select("status")
            .lean();

        const statusCounts = {};
        orders.forEach(order => {
            const status = order?.status || "Pending";
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
        const colors = {
            Delivered: 'bg-green-500', Shipped: 'bg-blue-500', Pending: 'bg-yellow-500',
            Cancelled: 'bg-red-500', Packed: 'bg-purple-500', "Partial Payment": 'bg-orange-500'
        };

        const orderData = Object.keys(statusCounts).map(key => ({
            status: key, count: statusCounts[key],
            color: colors[key] || "bg-gray-400",
            percentage: total ? Math.round((statusCounts[key] / total) * 100) : 0
        }));

        const result = { success: true, orderData, totalOrders: total };
        setCache('orderStatus', result);
        return res.status(200).json(result);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ─── getRecentSalesData ────────────────────────────────────────────────────────
exports.getRecentSalesData = catchAsyncErrors(async (req, res) => {
    try {
        const cached = getCache('recentSales');
        if (cached) return res.status(200).json(cached);

        const orders = await AdminOrder.find({ recycleBin: { $ne: true } })
            .sort({ createdAt: -1 })
            .limit(20)
            .select("items createdAt status customer")
            .populate("customer.userId", "name")
            .populate({
                path: "items.productId",
                select: "productId singlePicPrice pcsInSet quantity color",
                populate: { path: "productId", model: "Product", select: "productName" }
            })
            .lean();

        const timeAgo = (date) => {
            const diff = (new Date() - new Date(date)) / 1000;
            if (diff < 60) return "just now";
            if (diff < 3600) return Math.floor(diff / 60) + " minutes ago";
            if (diff < 86400) return Math.floor(diff / 3600) + " hours ago";
            return Math.floor(diff / 86400) + " days ago";
        };

        const recentSales = [];
        orders.forEach(order => {
            order.items.forEach(item => {
                const productName = item?.productId?.productId?.productName
                    ? `${item.productId.productId.productName} / ${item.color || ""}`
                    : "Unknown Product";
                const qty = Number(item.quantity || 0);
                const pcsInSet = Number(item.pcsInSet || 1);
                const price = Number(item.singlePicPrice || 0);
                if (!qty || !price) return;
                const totalPcs = qty * pcsInSet;
                const totalAmount = totalPcs * price;
                recentSales.push({
                    id: `${order._id}-${item._id}`,
                    customer: order?.customer?.userId?.name || "Unknown Customer",
                    amount: `₹${totalAmount.toLocaleString()} | ${totalPcs} Pcs`,
                    product: productName,
                    status: order.status || "Processing",
                    time: timeAgo(order.createdAt)
                });
            });
        });

        const result = { success: true, recentSales };
        setCache('recentSales', result);
        return res.status(200).json(result);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
});
