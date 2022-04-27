import mongoose from "mongoose";
import { AlbumRating } from "./album-rating";
import { Comment } from "./comment";
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
        type: [mongoose.ObjectId], // User
        required: true,
        default: [],
    },
    comments: {
        type: [Comment],
        required: true,
        default: [],
    },
    rating: AlbumRating,
});

export const Review = mongoose.model("Review", reviewSchema);
