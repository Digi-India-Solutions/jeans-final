// controllers/termAndCondition-controller.js
const catchAsyncErrors   = require("../../middleware/catchAsyncErrors");
const ErrorHandler       = require("../../utils/ErrorHandler");
const TermAndCondition   = require("./termAndCondition-model");

// ─── GET — fetch existing T&C ─────────────────────────────────────────────────
// Always returns the single T&C document (there's only ever one)
exports.getTermAndCondition = catchAsyncErrors(async (req, res, next) => {
    try {
        const doc = await TermAndCondition.findOne({ isActive: true })
            .sort({ createdAt: -1 })
            .lean();

        if (!doc) {
            // ✅ Return success with null data — frontend checks for null to show "Create" button
            return res.status(200).json({
                success: true,
                data:    null,
                message: "No terms and conditions found",
            });
        }

        res.status(200).json({
            success: true,
            data:    doc,
        });
    } catch (err) {
        next(new ErrorHandler(err.message, 500));
    }
});

// ─── POST — create T&C ───────────────────────────────────────────────────────
exports.createTermAndCondition = catchAsyncErrors(async (req, res, next) => {
    try {
        const { terms, companyName } = req.body;

        // ✅ Validate
        if (!terms || !Array.isArray(terms) || terms.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Terms array is required and must not be empty",
            });
        }

        // ✅ Prevent duplicate — only one T&C document allowed
        const existing = await TermAndCondition.findOne();
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Terms and Conditions already exist. Use the update endpoint.",
                existingId: existing._id,
            });
        }

        const cleanedTerms = terms.map((t) => t.trim()).filter(Boolean);

        const doc = await TermAndCondition.create({
            companyName: companyName?.trim() || "Anibhavi Creation Pvt. Ltd.",
            terms:       cleanedTerms,
        });

        res.status(201).json({
            success: true,
            message: "Terms and Conditions created successfully",
            data:    doc,
        });
    } catch (err) {
        next(new ErrorHandler(err.message, 500));
    }
});

// ─── PUT — update T&C ────────────────────────────────────────────────────────
exports.updateTermAndCondition = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id }                 = req.params;
        const { terms, companyName } = req.body;

        if (!terms || !Array.isArray(terms) || terms.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Terms array is required and must not be empty",
            });
        }

        const cleanedTerms = terms.map((t) => t.trim()).filter(Boolean);

        const doc = await TermAndCondition.findByIdAndUpdate(
            id,
            {
                terms:       cleanedTerms,
                companyName: companyName?.trim() || undefined,
            },
            { new: true, runValidators: true }
        );

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: "Terms and Conditions not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Terms and Conditions updated successfully",
            data:    doc,
        });
    } catch (err) {
        next(new ErrorHandler(err.message, 500));
    }
});

// ─── DELETE — soft delete (set isActive false) ────────────────────────────────
exports.deleteTermAndCondition = catchAsyncErrors(async (req, res, next) => {
    try {
        const doc = await TermAndCondition.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: "Terms and Conditions not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Terms and Conditions deleted successfully",
        });
    } catch (err) {
        next(new ErrorHandler(err.message, 500));
    }
});