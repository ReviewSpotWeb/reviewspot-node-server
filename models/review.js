import mongoose from "mongoose";
const { Schema } = mongoose;

const reviewSchema = new Schema({
    author: {
        type: mongoose.ObjectId, // User
        required: true,
    },
    albumID: {
        type: String,
        required: true,
    },
    likedBy: {
        type: Array, // User
        required: true,
        default: [],
    },
    comments: {
        type: Array,
        required: true,
        default: [],
    },
    rating: {
        type: Object, // See ./album-rating.js
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
});

export const Review = mongoose.model("Review", reviewSchema);
