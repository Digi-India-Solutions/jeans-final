const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const Card = require("../addToCard/card-model");
const { AdminOrder } = require("../orders/orders-model");
const User = require("../users/users-model");



exports.getDashboardData = catchAsyncErrors(async (req, res) => {
    try {
        const start = req.query.start ? new Date(req.query.start) : new Date("2000-01-01");
        const end = req.query.end ? new Date(req.query.end) : new Date();

        const lastStartAdjusted = new Date(start);
        lastStartAdjusted.setMonth(start.getMonth() - 1);

        const lastEndAdjusted = new Date(end);
        lastEndAdjusted.setMonth(end.getMonth() - 1);

        const orders = await AdminOrder.find({ recycleBin: { $ne: true } })
            .populate({
                path: "items.productId",
                populate: {
                    path: "productId",
                    model: "Product",
                    populate: { path: "mainCategoryId", model: "MainCategory" }
                }
            })
            .populate("customer.userId");

        const buckets = {
            jeans: { current: { total: 0, orders: 0, pieces: 0 }, last: { total: 0 } },
            shirts: { current: { total: 0, orders: 0, pieces: 0 }, last: { total: 0 } },
            global: { totalSales: 0, pcs: 0, orders: 0 }
        };

        orders.forEach(order => {
            const isCurrent = order.createdAt >= start && order.createdAt <= end;
            const isLast = order.createdAt >= lastStartAdjusted && order.createdAt <= lastEndAdjusted;

            let hasJeans = false;
            let hasShirts = false;

            order.items.forEach(item => {
                const category = item?.productId?.productId?.mainCategoryId?.mainCategoryName || "";
                const price = parseInt(item?.productId?.filnalLotPrice || 0);
                const qty = parseInt(item?.quantity || 0);

                if (!price || !qty) return;

                if (category.includes("JEANS")) {
                    if (isCurrent) {
                        buckets.jeans.current.total += price * qty;
                        buckets.jeans.current.pieces += qty;
                        buckets.global.totalSales += price * qty;
                        buckets.global.pcs += qty;
                    }
                    if (isLast) buckets.jeans.last.total += price * qty;
                    hasJeans = true;

                } else if (category.includes("SHIRTS")) {
                    const perPiecePrice = parseInt(item.singlePicPrice || price);
                    const pcs = parseInt(item.pcsInSet || qty);

                    if (isCurrent) {
                        buckets.shirts.current.total += perPiecePrice * pcs;
                        buckets.shirts.current.pieces += pcs;
                        buckets.global.totalSales += perPiecePrice * pcs;
                        buckets.global.pcs += pcs;
                    }
                    if (isLast) buckets.shirts.last.total += perPiecePrice * pcs;
                    hasShirts = true;
                }
            });

            if (isCurrent) {
                if (hasJeans) buckets.jeans.current.orders++;
                if (hasShirts) buckets.shirts.current.orders++;
                buckets.global.orders++;
            }
        });

        // ----------- Helper: Convert number to Lakh format -----------
        // const toLakh = (num) => (num / 100000).toFixed(2) + "L";
        const formatLakh = (num = 0) => {
            if (num >= 100000) {
                // 1 lakh or more
                return (num / 100000)?.toFixed(num % 100000 === 0 ? 0 : 1) + 'L';
            } else if (num >= 1000) {
                // 1 thousand or more
                return (num / 1000)?.toFixed(num % 1000 === 0 ? 0 : 1) + 'K';
            } else {
                // below 1 thousand
                return num
            }
        }

        // ----------- Compute Growth % -----------
        const getGrowth = (current, last) => {
            if (last === 0) return "0%";
            return ((current - last) / last * 100).toFixed(1) + "%";
        };

        const stats = [
            {
                title: "Total Sales",
                value: `₹${formatLakh(buckets.global.totalSales)} | ${buckets.global.pcs} Pcs`,
                change: getGrowth(buckets.global.totalSales, buckets.jeans.last.total + buckets.shirts.last.total),
                changeType: "positive",
                icon: "ri-money-dollar-circle-line",
                color: "blue"
            },
            {
                title: "Jeans Sales",
                value: `₹${formatLakh(buckets.jeans.current.total)} | ${buckets.jeans.current.pieces} Pcs`,
                change: getGrowth(buckets.jeans.current.total, buckets.jeans.last.total),
                changeType: "positive",
                icon: "ri-shirt-line",
                color: "blue"
            },
            {
                title: "Shirts Sales",
                value: `₹${formatLakh(buckets.shirts.current.total)} | ${buckets.shirts.current.pieces} Pcs`,
                change: getGrowth(buckets.shirts.current.total, buckets.shirts.last.total),
                changeType: "positive",
                icon: "ri-t-shirt-line",
                color: "green"
            },
            {
                title: "Orders",
                value: `${buckets.global.orders}`,
                change: "+12.5%",
                changeType: "positive",
                icon: "ri-shopping-cart-line",
                color: "purple"
            },
            // {
            //     title: "Users",
            //     value: "N/A",
            //     change: "+5.2%",
            //     changeType: "positive",
            //     icon: "ri-user-line",
            //     color: "orange"
            // },
            // {
            //     title: "Cart Items",
            //     value: "N/A",
            //     change: "+22.1%",
            //     changeType: "positive",
            //     icon: "ri-shopping-bag-line",
            //     color: "pink"
            // }
        ];

        return res.status(200).json({ success: true, stats });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
});


exports.getCategoryComparisons = catchAsyncErrors(async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);

        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - 1);

        const ytdStart = new Date(today.getFullYear(), 0, 1);

        const orders = await AdminOrder.find({ recycleBin: { $ne: true } })
            .populate({
                path: "items.productId",
                populate: {
                    path: "productId",
                    model: "Product",
                    populate: { path: "mainCategoryId", model: "MainCategory" }
                }
            });

        const buckets = {
            jeans: createBucket(),
            shirts: createBucket()
        };

        function createBucket() {
            return {
                todaySales: 0, todayPcs: 0,
                weeklySales: 0, weeklyPcs: 0,
                monthlySales: 0, monthlyPcs: 0,
                ytdSales: 0, ytdPcs: 0,
                lastMonthSales: 0
            };
        }

        orders.forEach(order => {
            const created = new Date(order.createdAt);

            order.items.forEach(item => {
                const category =
                    item?.productId?.productId?.mainCategoryId?.mainCategoryName || "";

                const price = parseInt(item?.singlePicPrice || item?.productId?.filnalLotPrice || 0);
                const pcs = parseInt(item?.pcsInSet || item?.quantity || 0);

                const bucket =
                    category.includes("JEANS") ? buckets.jeans :
                        category.includes("SHIRTS") ? buckets.shirts :
                            null;

                if (!bucket) return;

                // TODAY
                if (created >= today) {
                    bucket.todaySales += price * pcs;
                    bucket.todayPcs += pcs;
                }

                // WEEK
                if (created >= weekStart) {
                    bucket.weeklySales += price * pcs;
                    bucket.weeklyPcs += pcs;
                }

                // MONTH
                if (created >= monthStart) {
                    bucket.monthlySales += price * pcs;
                    bucket.monthlyPcs += pcs;
                }

                // LAST MONTH (for growth)
                if (created >= monthStart.setMonth(monthStart.getMonth() - 1)) {
                    bucket.lastMonthSales += price * pcs;
                }

                // YTD
                if (created >= ytdStart) {
                    bucket.ytdSales += price * pcs;
                    bucket.ytdPcs += pcs;
                }
            });
        });

        // Calculate growth %
        const calcGrowth = (current, last) =>
            last === 0 ? 0 : ((current - last) / last * 100).toFixed(1);

        const data = {
            jeans: {
                ...buckets.jeans,
                growth: calcGrowth(buckets.jeans.monthlySales, buckets.jeans.lastMonthSales)
            },
            shirts: {
                ...buckets.shirts,
                growth: calcGrowth(buckets.shirts.monthlySales, buckets.shirts.lastMonthSales)
            }
        };

        return res.status(200).json({ success: true, categoryComparison: data });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

exports.getSalesChartData = catchAsyncErrors(async (req, res) => {
    try {
        const orders = await AdminOrder.find({ recycleBin: { $ne: true } })
            .populate({
                path: "items.productId",
                populate: {
                    path: "productId",
                    model: "Product",
                    populate: { path: "mainCategoryId", model: "MainCategory" }
                }
            });

        // --- Prepare 12 months with 0 sales ---
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const monthlyTotals = months.map(m => ({ month: m, sales: 0 }));

        // --- Process each order ---
        orders.forEach(order => {
            const monthIndex = new Date(order.createdAt).getMonth();

            order.items.forEach(item => {
                const price = parseInt(item.singlePicPrice || item.productId?.filnalLotPrice || 0);
                const pcs = parseInt(item.pcsInSet || item.quantity || 0);

                if (!price || !pcs) return;

                const total = price * pcs;

                monthlyTotals[monthIndex].sales += total;
            });
        });

        return res.status(200).json({
            success: true,
            salesData: monthlyTotals
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

exports.getOrderStatusChartData = catchAsyncErrors(async (req, res) => {
    try {
        const orders = await AdminOrder.find({ recycleBin: { $ne: true } });

        // Count orders per status
        const statusCounts = {
            Delivered: 0,
            Shipped: 0,
            Pending: 0,
            Canceled: 0
        };

        orders.forEach(order => {
            const status = order.status || 'Pending';
            if (statusCounts[status] !== undefined) {
                statusCounts[status]++;
            }
        });

        const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

        // Color mapping
        const colors = {
            Delivered: 'bg-green-500',
            Shipped: 'bg-blue-500',
            Pending: 'bg-yellow-500',
            Canceled: 'bg-red-500'
        };

        // Format response exactly like your frontend needs
        const orderData = Object.keys(statusCounts).map(key => ({
            status: key,
            count: statusCounts[key],
            color: colors[key],
            percentage: total === 0 ? 0 : Math.round((statusCounts[key] / total) * 100)
        }));

        return res.status(200).json({
            success: true,
            orderData,
            totalOrders: total
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

exports.getRecentSalesData = catchAsyncErrors(async (req, res) => {
    try {
        const orders = await AdminOrder.find({ recycleBin: { $ne: true } })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("customer.userId")
            .populate({
                path: "items.productId",
                populate: {
                    path: "productId",
                    model: "Product",
                }
            });

        // helper to convert time to "x hours ago"
        const timeAgo = (date) => {
            const now = new Date();
            const diff = (now - date) / 1000; // seconds

            if (diff < 60) return "just now";
            if (diff < 3600) return Math.floor(diff / 60) + " minutes ago";
            if (diff < 86400) return Math.floor(diff / 3600) + " hours ago";
            return Math.floor(diff / 86400) + " days ago";
        };

        const recentSales = [];

        orders.forEach((order, index) => {
            order.items.forEach(item => {
                // console.log('DDD==>', item.name);
                const productName = item?.name || item?.productId?.productId?.productName || "Unknown Product";
                const customerName = order?.customer?.userId?.name || "Unknown Customer";

                const price = parseInt(item?.productId?.filnalLotPrice || 0);
                const qty = parseInt(item?.quantity || 1);

                const amountString = `₹${(price * qty).toLocaleString()} | ${qty} Pc`;

                recentSales.push({
                    id: index + 1,
                    customer: customerName,
                    amount: amountString,
                    product: productName,
                    status: order.status || "Processing",
                    time: timeAgo(order.createdAt)
                });
            });
        });

        return res.status(200).json({
            success: true,
            recentSales
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


