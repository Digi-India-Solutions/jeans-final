const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const { deleteLocalFile } = require("../../middleware/DeleteImageFromLoaclFolder");
const { uploadImage, deleteImage } = require("../../middleware/Uploads");
const Review = require("./review-model");
const User = require('../users/users-model');


exports.createReview = catchAsyncErrors(async (req, res) => {
    try {
        const { userId, rating, reviewText, productId } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(201).json({ success: false, message: 'User not found' });
        }
        const review = await Review.findOne({ userId, productId });
        if (review) {
            return res.status(200).json({ success: false, message: 'You have already reviewed this product' });
        }
        const imageUrls = [];
        for (let file of req.files) {
            const imageUrl = await uploadImage(file.path);
            imageUrls.push(imageUrl);
            console.log("DDDDDDD:-------:----:=", file.path)
            deleteLocalFile(file.path);
        }

        const newReview = new Review({ userId, rating, reviewText, images: imageUrls, productId });

        await newReview.save();

        res.status(201).json({ success: true, message: 'Review added successfully', review: newReview });

    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ success: false, message: 'Failed to add review', error: error.message });
    }
})

exports.getAllReviews = catchAsyncErrors(async (req, res) => {
    try {
        const reviews = await (await Review.find().populate('userId').populate('productId')).reverse()

        if (!reviews || reviews.length === 0) {
            return res.status(204).json({ success: false, message: 'No reviews found' });
        }

        res.status(200).json({ success: true, message: 'Reviews fetched successfully', reviews });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: error.message });
    }
})

exports.changeReviewStatus = catchAsyncErrors(async (req, res) => {
    try {
        const { reviewId, status } = req.body;

        // Validate that reviewId and status are provided
        if (!reviewId || typeof status === 'undefined') {
            return res.status(200).json({ success: false, message: 'Review ID and status are required' });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(204).json({ success: false, message: 'Review not found' });
        }

        review.status = status;
        await review.save();
        res.status(200).json({ success: true, message: 'Review status updated successfully', review });

    } catch (error) {
        console.error('Error updating review status:', error);
        res.status(500).json({ success: false, message: 'Failed to update review status', error: error.message });
    }
})

exports.deleteReview = catchAsyncErrors(async (req, res) => {
    try {
        if (!req.params.id || req.params.id.trim() === '') {
            return res.status(400).json({ success: false, message: 'Review ID is required', });
        }

        const review = await Review.findByIdAndDelete(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found', });
        }

        if (Array.isArray(review.images) && review.images.length > 0) {
            for (const imgUrl of review.images) {
                await deleteImage(imgUrl);
            }
        }

        res.status(200).json({ success: true, message: 'Review deleted successfully', review, });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ success: false, message: 'Failed to delete review', error: error.message, });
    }
});


