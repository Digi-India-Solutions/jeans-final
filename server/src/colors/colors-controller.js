const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const Color = require("./colors-model");

exports.createColor = catchAsyncErrors(async (req, res, next) => {
    try {
        const { colorName, colorStatus, color } = req.body;

        if (!colorName) {
            return next(new ErrorHandler("Color is required", 400));
        }

        // Check if size already exists
        const existingColor = await Color.find({ colorName });

        if (existingColor.length > 0) {
            return res.status(200).json({ success: false, message: "Color already exists" });
        }

        const newColor = await Color.create({ colorName: colorName, colorStatus: colorStatus, color });
        console.log("existingSizeX:----- : ", newColor);

        res.status(201).json({ success: true, message: "Color created successfully", data: newColor, });
    } catch (error) {
        console.error("Create Color Error:", error);
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getAllColors = catchAsyncErrors(async (req, res, next) => {
    try {
        const { pageNumber } = req.query;
        const totalColors = await Color.countDocuments();

        const colors = await Color.find({}).sort({ createdAt: -1 }).skip((pageNumber - 1) * 15).limit(15)

        res.status(200).json({ success: true, data: colors, totalColors, totalPages: Math.ceil(totalColors / 15), currentPage: parseInt(pageNumber, 10) });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.changeStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        const { colorId, colorStatus } = req.body;
        console.log("colorId", colorId);
        const colors = await Color.findByIdAndUpdate(colorId, { colorStatus }).sort({ createdAt: -1 })
        res.status(200).json({ massage: "Color Status Updated Successfully", success: true, data: colors });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getColorByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const colorID = req.params.id;
        const colors = await Color.findOne({ _id: colorID })
        res.status(200).json({ massage: "Color Fetched Successfully", success: true, data: colors });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})



exports.updateColorByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const colorID = req.params.id;
        const { color, colorStatus, colorName } = req.body;
        console.log("colorIDs", req.body);
        const colors = await Color.findByIdAndUpdate(colorID, { colorName, colorStatus, color: color }).sort({ createdAt: -1 })
        res.status(200).json({ massage: "Colors Updated Successfully", success: true, data: colors });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.deleteColorByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const colorID = req.params.id;
        const colors = await Color.findByIdAndDelete(colorID)
        res.status(200).json({ massage: "Color Deleted Successfully", success: true, data: colors });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})  

exports.getColors= catchAsyncErrors(async (req, res, next) => {
    try {
        const colors = await Color.find({}).sort({ createdAt: -1 })
        res.status(200).json({ massage: "Colors Fetched Successfully", success: true, data: colors });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})