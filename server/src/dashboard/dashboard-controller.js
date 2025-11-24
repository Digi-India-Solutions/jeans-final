const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const Card = require("../addToCard/card-model");
const { AdminOrder } = require("../orders/orders-model");
const User = require("../users/users-model");



exports.getDashboardData = catchAsyncErrors(async (req, res) => {
    try {
        /* ------------------------------------------------------------------
           1) GLOBAL ORDER STATS (very fast even with 1M+ documents)
        ------------------------------------------------------------------ */
        const orderStats = await AdminOrder.aggregate([
            { $match: { recycleBin: false } },

            // Compute PCS & Amount inside pipeline
            {
                $project: {
                    total: 1,
                    items: {
                        $map: {
                            input: "$items",
                            as: "i",
                            in: {
                                pcs: { $multiply: ["$$i.quantity", "$$i.pcsInSet"] },
                                amount: { $multiply: ["$$i.quantity", "$$i.singlePicPrice"] }
                            }
                        }
                    }
                }
            },

            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$total" },
                    totalPcs: {
                        $sum: {
                            $reduce: {
                                input: "$items",
                                initialValue: 0,
                                in: { $add: ["$$value", "$$this.pcs"] }
                            }
                        }
                    },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        const aggregatedOrder = orderStats[0] || { totalSales: 0, totalPcs: 0, totalOrders: 0 };

        /* ------------------------------------------------------------------
           2) CATEGORY-WISE SALES
        ------------------------------------------------------------------ */
        const categoryStats = await AdminOrder.aggregate([
            { $match: { recycleBin: false } },
            { $unwind: "$items" },

            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "product"
                }
            },

            { $unwind: "$product" },

            {
                $group: {
                    _id: "$product.category",
                    totalAmount: { $sum: { $multiply: ["$items.quantity", "$items.singlePicPrice"] } },
                    totalPcs: { $sum: { $multiply: ["$items.quantity", "$items.pcsInSet"] } }
                }
            }
        ]);
        console.log("ZZZZZZZ:=>", categoryStats)

        let categoryMap = {};
        categoryStats.forEach(c => {
            categoryMap[c._id] = {
                amount: c.totalAmount,
                pcs: c.totalPcs
            };
        });

        /* ------------------------------------------------------------------
           3) USER COUNT
        ------------------------------------------------------------------ */
        const totalUsers = await User.estimatedDocumentCount();

        /* ------------------------------------------------------------------
           4) CART PCS
        ------------------------------------------------------------------ */
        const cartAggregation = await Card.aggregate([
            { $unwind: "$items" },
            { $group: { _id: null, pcs: { $sum: "$items.quantity" } } }
        ]);
        const cartPcs = cartAggregation[0]?.pcs || 0;

        /* ------------------------------------------------------------------
           5) FINAL FORMATTED STATS FOR UI
        ------------------------------------------------------------------ */
        const shirtsSales = await AdminOrder.aggregate([
            { $match: { recycleBin: false } },

            { $unwind: "$items" },

            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "product"
                }
            },

            { $unwind: "$product" },

            {
                $lookup: {
                    from: "maincategories",
                    localField: "product.mainCategoryId",
                    foreignField: "_id",
                    as: "mainCategory"
                }
            },

            { $unwind: "$mainCategory" },

            // 🔥 FILTER ONLY SHIRTS
            { $match: { "mainCategory.mainCategoryName": "SHIRTS" } },

            {
                $group: {
                    _id: "SHIRTS",
                    totalAmount: { $sum: "$items.singlePicPrice" },
                    totalPcs: { $sum: "$items.quantity" }
                }
            }
        ]);
        console.log("shirtsSales:==>", shirtsSales)
        // const jeansSales = await AdminOrder.aggregate([
        //     { $match: { recycleBin: false } },

        //     { $unwind: "$items" },

        //     {
        //         $lookup: {
        //             from: "products",
        //             localField: "items.productId",
        //             foreignField: "_id",
        //             as: "product"
        //         }
        //     },

        //     { $unwind: "$product" },

        //     {
        //         $lookup: {
        //             from: "maincategories",
        //             localField: "product.mainCategoryId",
        //             foreignField: "_id",
        //             as: "mainCategory"
        //         }
        //     },

        //     { $unwind: "$mainCategory" },

        //     // 🔥 FILTER ONLY JEANS
        //     { $match: { "mainCategory.mainCategoryName": "JEANS" } },

        //     {
        //         $group: {
        //             _id: "JEANS",
        //             totalAmount: { $sum: "$items.singlePicPrice" },
        //             totalPcs: { $sum: "$items.quantity" }
        //         }
        //     }
        // ]);

        const result = shirtsSales[0] || { totalAmount: 0, totalPcs: 0 };
        // const result2 = jeansSales[0] || { totalAmount: 0, totalPcs: 0 };



        // const data = jeansData.map(item => item.items)
        // const data2 = data.map(item => item.map((item) => (item.productId)))
        // const data3 = data2.map(item => item.map((item) => (item.productId)))
        // const data4 = data3.map(item => item.map((item) => (item.mainCategoryId?.mainCategoryName)))

        console.log("ZZZXXXXXZZ:==>X", jeansData, data4)



        const stats = [
            {
                title: "Total Sales",
                value: `₹${aggregatedOrder.totalSales.toLocaleString()} | ${aggregatedOrder.totalPcs} Pcs`,
                change: "+12.5%",
                changeType: "positive",
                icon: "ri-money-dollar-circle-line",
                color: "blue"
            },
            // {
            //     title: "Jeans Sales",
            //     value: `₹${(result2?.totalAmount || 0).toLocaleString()} | ${(result2?.totalPcs || 0)} Pcs`,
            //     change: "+15.2%",
            //     changeType: "positive",
            //     icon: "ri-shirt-line",
            //     color: "blue"
            // },
            {
                title: "Shirts Sales",
                value: `₹${(result?.totalAmount || 0).toLocaleString()} | ${(result?.totalPcs || 0)} Pcs`,
                change: "+8.3%",
                changeType: "positive",
                icon: "ri-t-shirt-line",
                color: "green"
            },
            {
                title: "Orders",
                value: `${aggregatedOrder.totalOrders}`,
                change: "+18.0%",
                changeType: "positive",
                icon: "ri-shopping-cart-line",
                color: "purple"
            },
            {
                title: "Users",
                value: `${totalUsers}`,
                change: "+5.2%",
                changeType: "positive",
                icon: "ri-user-line",
                color: "orange"
            },
            {
                title: "Cart Items",
                value: `${cartPcs} | ${cartPcs} Pcs`,
                change: "+22.1%",
                changeType: "positive",
                icon: "ri-shopping-bag-line",
                color: "pink"
            }
        ];

        return res.status(200).json({
            success: true,
            stats,
            raw: { aggregatedOrder, categoryMap, totalUsers, cartPcs }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

