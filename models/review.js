import mongoose from "mongoose";
import { AlbumRating } from "./album-rating";
import { Comment } from "./comment";
const { Schema } = mongoose;

const reviewSchema = new Schema({
    author: mongoose.ObjectId,
    albumID: String,
    likedBy: [mongoose.ObjectId],
    comments: {
        type: [Comment],
        // This is so that we don't have to initialize
        // a list, and can just simply append a comment
        // without checking that it exists.
        required: true,
        default: [],
    },
    rating: AlbumRating,
});

export const Review = mongoose.model("Review", reviewSchema);
