const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder");
const { uploadsPdf } = require("../../middleware/Uploads");
const Catalogue = require("./catalogues-model");
const fs = require("fs");
const path = require("path");

// exports.uploadPdf = async (req, res) => {
//     try {
//         // const { originalname, size } = req.file;
//         console.log("DDDDDDDDDDDD:==>", req.file)
//         let uploadPdf = '';

//         if (!req.file) {
//             return res.status(200).json({ status: false, message: "No files uploaded" });
//         } else {
//             uploadPdf = await uploadsPdf(req.file.path);
//             if (uploadPdf) {
//                 deleteLocalFile(req.file.path);
//             }
//         }

//         // uploadPdf = await uploadsPdf(req.file.path);
//         console.log("DDDDDDDDDDDD:==>", uploadPdf)
//         const newCatalogue = new Catalogue({
//             fileName: uploadPdf.public_id,
//             originalName: uploadPdf.original_filename,
//             fileSize: `${(uploadPdf.bytes / (1024 * 1024)).toFixed(1)} MB`,
//             uploadDate: new Date(),
//             fileUrl: uploadPdf.secure_url,
//             cloudinaryPublicId: uploadPdf.public_id,
//         });

//         await newCatalogue.save();

//         res.status(201).json({ status: true, message: "Catalogue uploaded successfully", data: newCatalogue });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Database save failed", error: error.message });
//     }
// };

exports.uploadPdf = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({ status: false, message: "No file uploaded" });
        }

        console.log("Uploaded File:==>", req.file);

        const file = req.file;

        const newCatalogue = new Catalogue({
            fileName: file.filename,                      // saved file name
            originalName: file.originalname,              // original file name
            fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`, // MB format
            uploadDate: new Date(),
            fileUrl: file.path.replace(/\\/g, "/"),       // convert backslash for safety
            cloudinaryPublicId: null                      // since using local upload
        });

        await newCatalogue.save();

        res.status(201).json({
            status: true,
            message: "Catalogue uploaded successfully",
            data: newCatalogue
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Database save failed",
            error: error.message
        });
    }
};



exports.getAllCataloguePdf = catchAsyncErrors(async (req, res, next) => {
    try {
        const catalogues = await Catalogue.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: catalogues });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


exports.getAllCataloguePdfWithPagination = catchAsyncErrors(async (req, res) => {
    try {
        // 1) Query params with defaults
        let {
            page = 1,
            limit = 10,
            search = "",
            sortBy = "uploadDate",
            sortOrder = "desc",
            dateFrom = "",
            dateTo = ""
        } = req.query;

        page = Math.max(parseInt(page) || 1, 1);
        limit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
        console.log("limit:==>", search)
        // 2) Build filter
        const filter = {};
        if (search) {
            filter.$or = [
                { originalName: { $regex: search, $options: "i" } },
                { fileName: { $regex: search, $options: "i" } },
            ];
        }
        if (dateFrom || dateTo) {
            filter.uploadDate = {};
            if (dateFrom) filter.uploadDate.$gte = new Date(dateFrom);
            if (dateTo) {
                const endOfDay = new Date(dateTo);
                endOfDay.setHours(23, 59, 59, 999);
                filter.uploadDate.$lte = endOfDay;
            }
        }

        // 3) Sort options
        const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        // 4) Counts for pagination
        const totalDocuments = await Catalogue.countDocuments(filter);
        const totalPages = Math.ceil(totalDocuments / limit);
        const skip = (page - 1) * limit;

        // 5) Page data
        const catalogues = await Catalogue.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean();

        // 6) Metrics via aggregation (fast & safe)
        //    - totalDownloadCount: sum of downloadCount (treat missing as 0)
        //    - totalFileSizeMB: if fileSize is "1.2 MB" -> 1.2, if numeric bytes -> bytes/MB
        const metricsAgg = await Catalogue.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalDownloadCount: { $sum: { $ifNull: ["$downloadCount", 0] } },
                    totalFileSizeMB: {
                        $sum: {
                            $switch: {
                                branches: [
                                    // fileSize stored as "1.2 MB"
                                    {
                                        case: { $eq: [{ $type: "$fileSize" }, "string"] },
                                        then: {
                                            $toDouble: {
                                                $arrayElemAt: [{ $split: ["$fileSize", " "] }, 0],
                                            },
                                        },
                                    },
                                    // fileSize stored as number (bytes)
                                    {
                                        case: { $in: [{ $type: "$fileSize" }, ["int", "long", "double", "decimal"]] },
                                        then: { $divide: ["$fileSize", 1024 * 1024] },
                                    },
                                ],
                                default: 0,
                            },
                        },
                    },
                },
            },
        ]);

        const totalDownloadCount = metricsAgg[0]?.totalDownloadCount || 0;
        const totalFileSize = Number((metricsAgg[0]?.totalFileSizeMB || 0).toFixed(1));

        // 7) Today’s uploads (based on server local time)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const totalToday = await Catalogue.countDocuments({
            ...filter,
            uploadDate: { $gte: startOfToday, $lte: endOfToday },
        });

        // 8) Response
        res.status(200).json({
            status: true,
            pagination: {
                totalDocuments,
                totalPages,
                currentPage: page,
                pageSize: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                totalDownloadCount,
                totalFileSize,
                totalToday,
            },
            data: catalogues,
        });
    } catch (err) {
        console.error("Error fetching catalogues:", err);
        res.status(500).json({
            status: false,
            message: "Failed to fetch catalogues",
            error: err.message,
        });
    }
});


exports.deleteCatalogue = catchAsyncErrors(async (req, res, next) => {
    try {
        const catalogue = await Catalogue.findById(req.params.id);

        if (!catalogue) {
            return res.status(404).json({
                success: false,
                message: "Catalogue not found",
            });
        }

        // Build full file path
        const filePath = path.resolve(__dirname, `../../Public/${catalogue.fileName}`);

        // Delete file only if exists
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) console.error("File delete error:", err);
            });
        } else {
            console.log("File not found, skipping delete:", filePath);
        }

        // Delete record from DB
        await Catalogue.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: "Catalogue deleted successfully", });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message, });
    }
});