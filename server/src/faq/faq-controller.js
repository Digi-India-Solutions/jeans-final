const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const Faq = require("./faq-model");

exports.createFaq = catchAsyncErrors(async (req, res, next) => {
    const { question, answer } = req.body;

    if (!question || !answer) {
        return res.status(400).json({ success: false, message: "Question and answer are required" });
    }

    const faq = await Faq.create({ question, answer });

    res.status(201).json({ success: true, message: "FAQ created successfully", faq });
});

exports.getAllFaqs = catchAsyncErrors(async (req, res, next) => {
    const faqs = await Faq.find().sort({ createdAt: -1 });

    res.status(200).json({ success: true, faqs });
});

exports.getFaqById = catchAsyncErrors(async (req, res, next) => {
    const faq = await Faq.findById(req.params.id);

    if (!faq) {
        return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    res.status(200).json({ success: true, faq });
});

exports.updateFaq = catchAsyncErrors(async (req, res, next) => {
    const { question, answer ,isActive} = req.body;

    const faq = await Faq.findByIdAndUpdate(req.params.id, { question, answer,isActive }, { new: true, runValidators: true });

    if (!faq) {
        return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    res.status(200).json({ success: true, message: "FAQ updated successfully", faq });
});

exports.deleteFaq = catchAsyncErrors(async (req, res, next) => {
    const faq = await Faq.findByIdAndDelete(req.params.id);

    if (!faq) {
        return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    res.status(200).json({ success: true, message: "FAQ deleted successfully" });
});

exports.faqStatus = catchAsyncErrors(async (req, res, next) => {
    try {
        const { isActive } = req.body
        // console.log("isActive:----------:--------:=", isActive);
        const faq = await Faq.findById(req.params.id);
        if (!faq) {
            return res.status(404).json({ success: false, message: "FAQ not found" });
        }
        faq.isActive = isActive;

        await faq.save();
        res.status(200).json({ success: true, message: `Marked as ${faq.isActive ? 'Active' : 'Inactive'}` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update status" });
    }
})
