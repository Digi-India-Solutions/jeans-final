const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const Card = require("../addToCard/card-model");
const { AdminOrder } = require("../orders/orders-model");
const User = require("../users/users-model");



// exports.getDashboardData = catchAsyncErrors(async (req, res) => {
//     try {
//         const start = req.query.start ? new Date(req.query.start) : new Date("2000-01-01");
//         const end = req.query.end ? new Date(req.query.end) : new Date();

//         const lastStartAdjusted = new Date(start);
//         lastStartAdjusted.setMonth(start.getMonth() - 1);

//         const lastEndAdjusted = new Date(end);
//         lastEndAdjusted.setMonth(end.getMonth() - 1);

//         const orders = await AdminOrder.find({ recycleBin: { $ne: true } })
//             .populate({
//                 path: "items.productId",
//                 populate: {
//                     path: "productId",
//                     model: "Product",
//                     populate: { path: "mainCategoryId", model: "MainCategory" }
//                 }
//             })
//             .populate("customer.userId");

//             console.log("orders==> orders=> orders==> orders=>" ,orders ,orders.map((item)=> item.items))
//         const buckets = {
//             jeans: { current: { total: 0, orders: 0, pieces: 0 }, last: { total: 0 } },
//             shirts: { current: { total: 0, orders: 0, pieces: 0 }, last: { total: 0 } },
//             global: { totalSales: 0, pcs: 0, orders: 0 }
//         };

//         orders.forEach(order => {
//             const isCurrent = order.createdAt >= start && order.createdAt <= end;
//             const isLast = order.createdAt >= lastStartAdjusted && order.createdAt <= lastEndAdjusted;

//             let hasJeans = false;
//             let hasShirts = false;

//             order.items.forEach(item => {
//                 const category = item?.productId?.productId?.mainCategoryId?.mainCategoryName || "";
//                 const price = parseInt(item?.productId?.filnalLotPrice || 0);
//                 const qty = parseInt(item?.quantity || 0);

// console.log("AXXAXXA=>" , price, qty ,category)
//                 if (!price || !qty) return;

//                 if (category.includes("JEANS")) {
//                     const pcs = parseInt(item.pcsInSet || qty);

//                     if (isCurrent) {
//                         buckets.jeans.current.total += price * qty;
//                         buckets.jeans.current.pieces += pcs;
//                         buckets.global.totalSales += price * qty;
//                         buckets.global.pcs += parseInt(item.pcsInSet || qty);
//                     }
//                     if (isLast) buckets.jeans.last.total += price * qty;
//                     hasJeans = true;

//                 } else if (category.includes("SHIRTS")) {
//                     const perPiecePrice = parseInt(item.singlePicPrice || price);
//                     const pcs = parseInt(item.pcsInSet || qty);

//                     if (isCurrent) {
//                         buckets.shirts.current.total += perPiecePrice * pcs;
//                         buckets.shirts.current.pieces += pcs;
//                         buckets.global.totalSales += perPiecePrice * pcs;
//                         buckets.global.pcs += pcs;
//                     }
//                     if (isLast) buckets.shirts.last.total += perPiecePrice * pcs;
//                     hasShirts = true;
//                 }
//             });

//             if (isCurrent) {
//                 if (hasJeans) buckets.jeans.current.orders++;
//                 if (hasShirts) buckets.shirts.current.orders++;
//                 buckets.global.orders++;
//             }
//         });

//         // ----------- Helper: Convert number to Lakh format -----------
//         // const toLakh = (num) => (num / 100000).toFixed(2) + "L";
//         const formatLakh = (num = 0) => {
//             if (num >= 100000) {
//                 // 1 lakh or more
//                 return (num / 100000)?.toFixed(num % 100000 === 0 ? 0 : 1) + 'L';
//             } else if (num >= 1000) {
//                 // 1 thousand or more
//                 return (num / 1000)?.toFixed(num % 1000 === 0 ? 0 : 1) + 'K';
//             } else {
//                 // below 1 thousand
//                 return num
//             }
//         }

//         // ----------- Compute Growth % -----------
//         const getGrowth = (current, last) => {
//             if (last === 0) return "0%";
//             return ((current - last) / last * 100).toFixed(1) + "%";
//         };

//         const stats = [
//             {
//                 title: "Total Sales",
//                 value: `₹${buckets.global.totalSales} | ${buckets.global.pcs} Pcs`,
//                 change: getGrowth(buckets.global.totalSales, buckets.jeans.last.total + buckets.shirts.last.total),
//                 changeType: "positive",
//                 icon: "ri-money-dollar-circle-line",
//                 color: "blue"
//             },
//             {
//                 title: "Jeans Sales",
//                 value: `₹${buckets.jeans.current.total} | ${buckets.jeans.current.pieces} Pcs`,
//                 change: getGrowth(buckets.jeans.current.total, buckets.jeans.last.total),
//                 changeType: "positive",
//                 icon: "ri-shirt-line",
//                 color: "blue"
//             },
//             {
//                 title: "Shirts Sales",
//                 value: `₹${buckets.shirts.current.total} | ${buckets.shirts.current.pieces} Pcs`,
//                 change: getGrowth(buckets.shirts.current.total, buckets.shirts.last.total),
//                 changeType: "positive",
//                 icon: "ri-t-shirt-line",
//                 color: "green"
//             },
//             {
//                 title: "Orders",
//                 value: `${buckets.global.orders}`,
//                 change: "+12.5%",
//                 changeType: "positive",
//                 icon: "ri-shopping-cart-line",
//                 color: "purple"
//             },
//             // {
//             //     title: "Users",
//             //     value: "N/A",
//             //     change: "+5.2%",
//             //     changeType: "positive",
//             //     icon: "ri-user-line",
//             //     color: "orange"
//             // },
//             // {
//             //     title: "Cart Items",
//             //     value: "N/A",
//             //     change: "+22.1%",
//             //     changeType: "positive",
//             //     icon: "ri-shopping-bag-line",
//             //     color: "pink"
//             // }
//         ];

//         console.log("stats==>" ,stats)
//         return res.status(200).json({ success: true, stats });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ success: false, message: error.message });
//     }
// });

exports.getDashboardData = catchAsyncErrors(async (req, res) => {
    try {
        const start = req.query.start ? new Date(req.query.start) : new Date("2000-01-01");
        const end = req.query.end ? new Date(req.query.end) : new Date();

        const lastStart = new Date(start);
        lastStart.setMonth(start.getMonth() - 1);

        const lastEnd = new Date(end);
        lastEnd.setMonth(end.getMonth() - 1);

        const orders = await AdminOrder.find({ recycleBin: { $ne: true } })
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

                // ===== JEANS =====
                if (category.includes("JEANS")) {
                    if (isCurrent) {
                        buckets.jeans.current.total += totalAmount;
                        buckets.jeans.current.pieces += totalPcs;

                        buckets.global.totalSales += totalAmount;
                        buckets.global.pcs += totalPcs;
                    }

                    if (isLast) {
                        buckets.jeans.last.total += totalAmount;
                    }

                    hasJeans = true;
                }

                // ===== SHIRTS =====
                else if (category.includes("SHIRT")) {
                    if (isCurrent) {
                        buckets.shirts.current.total += totalAmount;
                        buckets.shirts.current.pieces += totalPcs;

                        buckets.global.totalSales += totalAmount;
                        buckets.global.pcs += totalPcs;
                    }

                    if (isLast) {
                        buckets.shirts.last.total += totalAmount;
                    }

                    hasShirts = true;
                }
            });

            if (isCurrent) {
                if (hasJeans) buckets.jeans.current.orders++;
                if (hasShirts) buckets.shirts.current.orders++;
                buckets.global.orders++;
            }
        });

        // ===== FORMAT =====
        const formatMoney = (num = 0) => {
            if (num >= 100000) return (num / 100000).toFixed(1) + "L";
            if (num >= 1000) return (num / 1000).toFixed(1) + "K";
            return num;
        };

        const getGrowth = (current, last) => {
            if (!last) return "0%";
            return (((current - last) / last) * 100).toFixed(1) + "%";
        };

        const stats = [
            {
                title: "Total Sales",
                value: `₹${buckets.global.totalSales} | ${buckets.global.pcs} Pcs`,
                change: getGrowth(
                    buckets.global.totalSales,
                    buckets.jeans.last.total + buckets.shirts.last.total
                ),
                changeType: "positive",
                icon: "ri-money-dollar-circle-line",
                color: "blue"
            },
            {
                title: "Jeans Sales",
                value: `₹${buckets.jeans.current.total} | ${buckets.jeans.current.pieces} Pcs`,
                change: getGrowth(buckets.jeans.current.total, buckets.jeans.last.total),
                changeType: "positive",
                icon: "ri-shirt-line",
                color: "blue"
            },
            {
                title: "Shirts Sales",
                value: `₹${buckets.shirts.current.total} | ${buckets.shirts.current.pieces} Pcs`,
                change: getGrowth(buckets.shirts.current.total, buckets.shirts.last.total),
                changeType: "positive",
                icon: "ri-t-shirt-line",
                color: "green"
            },
            {
                title: "Orders",
                value: `${buckets.global.orders}`,
                change: "0%",
                changeType: "positive",
                icon: "ri-shopping-cart-line",
                color: "purple"
            }
        ];

        return res.status(200).json({ success: true, stats });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// exports.getCategoryComparisons = catchAsyncErrors(async (req, res) => {
//     try {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const weekStart = new Date();
//         weekStart.setDate(weekStart.getDate() - 7);

//         const monthStart = new Date();
//         monthStart.setMonth(monthStart.getMonth() - 1);

//         const ytdStart = new Date(today.getFullYear(), 0, 1);

//         const orders = await AdminOrder.find({ recycleBin: { $ne: true } })
//             .populate({
//                 path: "items.productId",
//                 populate: {
//                     path: "productId",
//                     model: "Product",
//                     populate: { path: "mainCategoryId", model: "MainCategory" }
//                 }
//             });

//         const buckets = {
//             jeans: createBucket(),
//             shirts: createBucket()
//         };

//         function createBucket() {
//             return {
//                 todaySales: 0, todayPcs: 0,
//                 weeklySales: 0, weeklyPcs: 0,
//                 monthlySales: 0, monthlyPcs: 0,
//                 ytdSales: 0, ytdPcs: 0,
//                 lastMonthSales: 0
//             };
//         }

//         orders.forEach(order => {
//             const created = new Date(order.createdAt);

//             order.items.forEach(item => {

//                 const price = parseInt(item?.singlePicPrice || item?.productId?.filnalLotPrice || 0);
//                 const pcs = parseInt(item?.pcsInSet || item?.quantity || 0);

//                   const category = item?.productId?.productId?.mainCategoryId?.mainCategoryName?.toUpperCase() || "";

//                 const qty = Number(item.quantity || 0);
//                 const pcsInSet = Number(item.pcsInSet || 1);
//                 const pricePerPiece = Number(item.singlePicPrice || 0);

//                 if (!qty || !pricePerPiece) return;

//                 const totalPcs = qty * pcsInSet;
//                 const totalAmount = totalPcs * pricePerPiece;


//                 const bucket =
//                     category.includes("JEANS") ? buckets.jeans :
//                         category.includes("SHIRTS") ? buckets.shirts :
//                             null;

//                 if (!bucket) return;

//                 // TODAY
//                 if (created >= today) {
//                     bucket.todaySales += price * pcs;
//                     bucket.todayPcs += pcs;
//                 }

//                 // WEEK
//                 if (created >= weekStart) {
//                     bucket.weeklySales += price * pcs;
//                     bucket.weeklyPcs += pcs;
//                 }

//                 // MONTH
//                 if (created >= monthStart) {
//                     bucket.monthlySales += price * pcs;
//                     bucket.monthlyPcs += pcs;
//                 }

//                 // LAST MONTH (for growth)
//                 if (created >= monthStart.setMonth(monthStart.getMonth() - 1)) {
//                     bucket.lastMonthSales += price * pcs;
//                 }

//                 // YTD
//                 if (created >= ytdStart) {
//                     bucket.ytdSales += price * pcs;
//                     bucket.ytdPcs += pcs;
//                 }
//             });
//         });

//         // Calculate growth %
//         const calcGrowth = (current, last) =>
//             last === 0 ? 0 : ((current - last) / last * 100).toFixed(1);

//         const data = {
//             jeans: {
//                 ...buckets.jeans,
//                 growth: calcGrowth(buckets.jeans.monthlySales, buckets.jeans.lastMonthSales)
//             },
//             shirts: {
//                 ...buckets.shirts,
//                 growth: calcGrowth(buckets.shirts.monthlySales, buckets.shirts.lastMonthSales)
//             }
//         };

//         return res.status(200).json({ success: true, categoryComparison: data });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ success: false, message: error.message });
//     }
// });

exports.getCategoryComparisons = catchAsyncErrors(async (req, res) => {
    try {
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
            .populate({
                path: "items.productId",
                populate: {
                    path: "productId",
                    model: "Product",
                    populate: { path: "mainCategoryId", model: "MainCategory" }
                }
            })
            .lean(); // 🔥 faster

        const createBucket = () => ({
            todaySales: 0, todayPcs: 0,
            weeklySales: 0, weeklyPcs: 0,
            monthlySales: 0, monthlyPcs: 0,
            ytdSales: 0, ytdPcs: 0,
            lastMonthSales: 0
        });

        const buckets = {
            jeans: createBucket(),
            shirts: createBucket()
        };

        orders.forEach(order => {
            const created = new Date(order.createdAt);

            order.items.forEach(item => {
                const category =
                    item?.productId?.productId?.mainCategoryId?.mainCategoryName?.toUpperCase() || "";

                const qty = Number(item.quantity || 0);
                const pcsInSet = Number(item.pcsInSet || 1);
                const pricePerPiece = Number(item.singlePicPrice || 0);

                if (!qty || !pricePerPiece) return;

                const totalPcs = qty * pcsInSet;
                const totalAmount = totalPcs * pricePerPiece;

                const bucket =
                    category.includes("JEANS") ? buckets.jeans :
                    category.includes("SHIRT") ? buckets.shirts :
                    null;

                if (!bucket) return;

                // ===== TODAY =====
                if (created >= today) {
                    bucket.todaySales += totalAmount;
                    bucket.todayPcs += totalPcs;
                }

                // ===== WEEK =====
                if (created >= weekStart) {
                    bucket.weeklySales += totalAmount;
                    bucket.weeklyPcs += totalPcs;
                }

                // ===== MONTH =====
                if (created >= monthStart) {
                    bucket.monthlySales += totalAmount;
                    bucket.monthlyPcs += totalPcs;
                }

                // ===== LAST MONTH (correct range) =====
                if (created >= lastMonthStart && created < monthStart) {
                    bucket.lastMonthSales += totalAmount;
                }

                // ===== YTD =====
                if (created >= ytdStart) {
                    bucket.ytdSales += totalAmount;
                    bucket.ytdPcs += totalPcs;
                }
            });
        });

        // ===== Growth =====
        const calcGrowth = (current, last) => {
            if (!last) return "0%";
            return (((current - last) / last) * 100).toFixed(1) + "%";
        };

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

        return res.status(200).json({
            success: true,
            categoryComparison: data
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// exports.getSalesChartData = catchAsyncErrors(async (req, res) => {
//     try {
//         const dateRange = req.query.dateRange || "Monthly";

//         const orders = await AdminOrder.find({ recycleBin: { $ne: true } })
//             .populate({
//                 path: "items.productId",
//                 populate: {
//                     path: "productId",
//                     model: "Product",
//                     populate: { path: "mainCategoryId", model: "MainCategory" }
//                 }
//             });

//         // ----------- Monthly Data -----------
//         const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
//             "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//         const monthlyData = months.map(m => ({ month: m, sales: 0 }));

//         // ----------- Weekly Data (1-4 weeks per month) ----------
//         const weeklyData = Array.from({ length: 4 }, (_, i) => ({
//             week: i + 1,
//             sales: 0
//         }));

//         // ----------- Daily Data (1–31) ----------
//         const dailyData = Array.from({ length: 31 }, (_, i) => ({
//             day: i + 1,
//             sales: 0
//         }));

//         // ----------- Process Orders -----------
//         orders.forEach(order => {
//             const date = new Date(order.createdAt);

//             const monthIndex = date.getMonth();
//             const weekIndex = Math.floor(date.getDate() / 8); // approx 4 weeks
//             const dayIndex = date.getDate() - 1;

//             order.items.forEach(item => {
//                 const price = parseInt(item.singlePicPrice || item.productId?.finalLotPrice || 0);
//                 const pcs = parseInt(item.pcsInSet || item.quantity || 0);

//                 if (!price || !pcs) return;

//                 const total = price * pcs;

//                 // Add to monthly
//                 monthlyData[monthIndex].sales += total;

//                 // Add to weekly
//                 if (weekIndex >= 0 && weekIndex < 4) {
//                     weeklyData[weekIndex].sales += total;
//                 }

//                 // Add to daily
//                 if (dayIndex >= 0 && dayIndex < 31) {
//                     dailyData[dayIndex].sales += total;
//                 }
//             });
//         });

//         // Select response based on range
//         let salesData =
//             dateRange === "Weekly" ? weeklyData :
//                 dateRange === "Daily" ? dailyData :
//                     monthlyData;

//         return res.status(200).json({
//             success: true,
//             salesData
//         });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ success: false, message: error.message });
//     }
// });

exports.getSalesChartData = catchAsyncErrors(async (req, res) => {
    try {
        const dateRange = req.query.dateRange || "Monthly";

        const orders = await AdminOrder.find({ recycleBin: { $ne: true } })
            .populate({
                path: "items.productId",
                populate: {
                    path: "productId",
                    model: "Product",
                    populate: { path: "mainCategoryId", model: "MainCategory" }
                }
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

                if (weeklyData[weekIndex]) {
                    weeklyData[weekIndex].sales += total;
                }

                if (dailyData[dayIndex]) {
                    dailyData[dayIndex].sales += total;
                }
            });
        });

        const salesData =
            dateRange === "Weekly" ? weeklyData :
            dateRange === "Daily" ? dailyData :
            monthlyData;

        return res.status(200).json({ success: true, salesData });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// exports.getOrderStatusChartData = catchAsyncErrors(async (req, res) => {
//     try {
//         const orders = await AdminOrder.find({ recycleBin: { $ne: true } });
//         console.log("orders::=>>", orders);
//         // Count orders per status
//         const statusCounts = {
//             Delivered: 0,
//             Shipped: 0,
//             Pending: 0,
//             Cancelled: 0,
//             Packed: 0
//         };

//         orders.forEach(order => {
//             const status = order?.status || 'Pending';
//             if (statusCounts[status] !== undefined) {
//                 statusCounts[status]++;
//             }
//         });

//         const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

//         // Color mapping
//         const colors = {
//             Delivered: 'bg-green-500',
//             Shipped: 'bg-blue-500',
//             Pending: 'bg-yellow-500',
//             Cancelled: 'bg-red-500',
//             Packed: 'bg-purple-500'
//         };

//         // Format response exactly like your frontend needs
//         const orderData = Object.keys(statusCounts).map(key => ({
//             status: key,
//             count: statusCounts[key],
//             color: colors[key],
//             percentage: total === 0 ? 0 : Math.round((statusCounts[key] / total) * 100)
//         }));

//         return res.status(200).json({ success: true, orderData, totalOrders: total });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ success: false, message: error.message });
//     }
// });

exports.getOrderStatusChartData = catchAsyncErrors(async (req, res) => {
    try {
        const orders = await AdminOrder.find({ recycleBin: { $ne: true } }).lean();

        const statusCounts = {};

        orders.forEach(order => {
            const status = order?.status || "Pending";
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

        const colors = {
            Delivered: 'bg-green-500',
            Shipped: 'bg-blue-500',
            Pending: 'bg-yellow-500',
            Cancelled: 'bg-red-500',
            Packed: 'bg-purple-500',
            "Partial Payment": 'bg-orange-500'
        };

        const orderData = Object.keys(statusCounts).map(key => ({
            status: key,
            count: statusCounts[key],
            color: colors[key] || "bg-gray-400",
            percentage: total ? Math.round((statusCounts[key] / total) * 100) : 0
        }));

        return res.status(200).json({
            success: true,
            orderData,
            totalOrders: total
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// exports.getRecentSalesData = catchAsyncErrors(async (req, res) => {
//     try {
//         const orders = await AdminOrder.find({ recycleBin: { $ne: true } })
//             .sort({ createdAt: -1 })
//             .limit(20)
//             .populate("customer.userId")
//             .populate({
//                 path: "items.productId",
//                 populate: {
//                     path: "productId",
//                     model: "Product",
//                 }
//             });

//         // helper to convert time to "x hours ago"
//         const timeAgo = (date) => {
//             const now = new Date();
//             const diff = (now - date) / 1000; // seconds

//             if (diff < 60) return "just now";
//             if (diff < 3600) return Math.floor(diff / 60) + " minutes ago";
//             if (diff < 86400) return Math.floor(diff / 3600) + " hours ago";
//             return Math.floor(diff / 86400) + " days ago";
//         };

//         const recentSales = [];

//         orders.forEach((order, index) => {
//             order.items.forEach(item => {
//                 // console.log('DDD==>', item.name);
//                 const productName = `${item?.productId?.productId?.productName} / ${item?.color}` || item?.productId?.productId?.productName || "Unknown Product";
//                 const customerName = order?.customer?.userId?.name || "Unknown Customer";

//                 const price = parseInt(item?.productId?.filnalLotPrice || 0);
//                 const qty = parseInt(item?.quantity || 1);

//                 const amountString = `₹${(price * qty).toLocaleString()} | ${qty} Pc`;

//                 recentSales.push({
//                     id: index + 1,
//                     customer: customerName,
//                     amount: amountString,
//                     product: productName,
//                     status: order.status || "Processing",
//                     time: timeAgo(order.createdAt)
//                 });
//             });
//         });

//         return res.status(200).json({
//             success: true,
//             recentSales
//         });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// });


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
            })
            .lean();

        const timeAgo = (date) => {
            const now = new Date();
            const diff = (now - new Date(date)) / 1000;

            if (diff < 60) return "just now";
            if (diff < 3600) return Math.floor(diff / 60) + " minutes ago";
            if (diff < 86400) return Math.floor(diff / 3600) + " hours ago";
            return Math.floor(diff / 86400) + " days ago";
        };

        const recentSales = [];

        orders.forEach((order, index) => {
            order.items.forEach(item => {
                const productName =
                    item?.productId?.productId?.productName
                        ? `${item.productId.productId.productName} / ${item.color || ""}`
                        : "Unknown Product";

                const customerName = order?.customer?.userId?.name || "Unknown Customer";

                const qty = Number(item.quantity || 0);
                const pcsInSet = Number(item.pcsInSet || 1);
                const price = Number(item.singlePicPrice || 0);

                if (!qty || !price) return;

                const totalPcs = qty * pcsInSet;
                const totalAmount = totalPcs * price;

                const amountString = `₹${totalAmount.toLocaleString()} | ${totalPcs} Pcs`;

                recentSales.push({
                    id: `${order._id}-${item._id}`,
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
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});