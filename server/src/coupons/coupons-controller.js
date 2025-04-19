const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const Coupon = require("./coupons-model")

exports.createCoupon = catchAsyncErrors(async (req, res, next) => {
    try {
        const { couponCode, discount, couponTitle } = req.body;
        console.log(couponCode, discount, couponTitle)

        const existingCoupon = await Coupon.findOne({ couponCode });
        if (existingCoupon) {
            return res.status(400).json({ success: false, message: "Coupon code already exists." });
        }

        const newCoupon = new Coupon({ couponCode, discount, couponTitle });
        await newCoupon.save();

        res.status(201).json({ success: true, message: "Coupon created successfully", coupon: newCoupon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
})

exports.getAllCoupons = catchAsyncErrors(async (req, res, next) => {
    try {
        const coupons = await Coupon.find();
        console.log(coupons)
        res.status(200).json({ success: true, coupons });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
})

exports.changeStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        const { couponId, status } = req.body

        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found." });
        }
        coupon.status = status;
        await coupon.save();

        res.status(200).json({ success: true, message: "Coupon status updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
})

exports.deleteCoupon = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedCoupon = await Coupon.findOneAndDelete({ _id: id });
        if (!deletedCoupon) {
            return res.status(404).json({ message: "Coupon not found." });
        }
        res.status(200).json({ success: true, message: "Coupon deleted successfully", coupon: deletedCoupon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
})

exports.getCouponById = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findOne({ _id: id });

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        res.status(200).json({ success: true, coupon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
})

exports.updateCoupon = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const { discount, couponCode, couponTitle } = req.body;

        if (!couponCode || typeof couponCode !== 'string') {
            return res.status(400).json({ message: "Invalid coupon code." });
        }

        if (discount == null || isNaN(discount) || discount < 0) {
            return res.status(400).json({ message: "Invalid discount value." });
        }

        const updatedCoupon = await Coupon.findOneAndUpdate(
            { _id: id },
            { discount, couponCode, couponTitle, updatedAt: Date.now() },
            { new: true } // Return the updated document
        );

        if (!updatedCoupon) {
            return res.status(404).json({ message: "Coupon not found." });
        }

        res.status(200).json({ success: true, message: "Coupon updated successfully", coupon: updatedCoupon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
})

exports.getCouponByCode = catchAsyncErrors(async (req, res, next) => {
    try {
        const { couponCode } = req.body;

        if (!couponCode) {
            return res.status(400).json({ success: false, message: "Coupon code is required." });
        }

        console.log("Searching exact couponCode:", couponCode);
        
        // couponCode = couponCode.trim().toUpperCase(); // case-insensitive handling
        // const coupon = await Coupon.findOne({ couponCode: { $regex: new RegExp(`^${couponCode}$`, 'i') } });

        const coupon = await Coupon.findOne({ couponCode });

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found." });
        }

        return res.status(200).json({ success: true, coupon });

    } catch (error) {
        console.error("Error fetching coupon:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

exports.getCouponByStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        const { status } = req.body
        const coupons = await Coupon.find({ status: status });
        if (!coupons) {
            return res.status(404).json({ message: "Coupon not found." });
        }

        res.status(200).json({ success: true, coupons });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
})
