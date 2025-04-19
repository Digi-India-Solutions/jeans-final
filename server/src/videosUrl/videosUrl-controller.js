const catchAsyncErrors = require("../../middleware/catchAsyncErrors")
const Video = require('./videosUrl-model');
const ShortUniqueId = require("short-unique-id");

exports.addUrl = catchAsyncErrors(async (req, res) => {
    const { videoUrl, } = req.body;

    if (!videoUrl) {
        return res.status(400).json({ success: false, message: "Video URL is required" });
    }

    const uniqueNumId = new ShortUniqueId({ length: 6, dictionary: "number" });
    const currentUniqueId = uniqueNumId.rnd();

    const newVideo = new Video({ videoUrl, uniqueVideoUrlId: currentUniqueId });
    await newVideo.save();

    res.status(201).json({ success: true, message: "Video added successfully", data: newVideo });
});

exports.getAllVideos = catchAsyncErrors(async (req, res) => {
    const videos = await Video.find().sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: videos });
});

exports.changeStatus = catchAsyncErrors(async (req, res) => {
    try {
        const { videoId, status } = req.body;

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found." });
        }

        video.status = status;
        await video.save();

        res.status(200).json({ success: true, message: "Video status updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

exports.getVideoById = catchAsyncErrors(async (req, res) => {
    const video = await Video.findById(req.params.id);

    if (!video) {
        return res.status(404).json({ success: false, message: "Video not found" });
    }

    res.status(200).json({ success: true, data: video });
});


exports.updateVideo = catchAsyncErrors(async (req, res) => {
    const { videoUrl } = req.body;

    const updated = await Video.findByIdAndUpdate(req.params.id, { videoUrl, updatedAt: Date.now(), }, { new: true });

    if (!updated) {
        return res.status(404).json({ success: false, message: "Video not found" });
    }

    res.status(200).json({ success: true, message: "Video updated successfully", data: updated });
});

exports.deleteVideo = catchAsyncErrors(async (req, res) => {
    const deleted = await Video.findByIdAndDelete(req.params.id);

    if (!deleted) {
        return res.status(404).json({ success: false, message: "Video not found" });
    }

    res.status(200).json({ success: true, message: "Video deleted successfully" });
});
