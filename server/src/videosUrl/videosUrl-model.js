const mongoose = require('mongoose');
const { Schema } = mongoose;

const videoSchema = new Schema({

    videoUrl: {
        type: String,
        require: true
    },
    uniqueVideoUrlId: {
        type: String,
        trim: true,
        default: ""
    },
    status: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

videoSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
