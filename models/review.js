import mongoose from "mongoose";
import { AlbumRating } from "./album-rating.js";
import { Comment } from "./comment.js";
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
    rating: Object,
});

export const Review = mongoose.model("Review", reviewSchema);
