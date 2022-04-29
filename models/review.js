import mongoose from "mongoose";
import { albumRatingSchema } from "./album-rating.js";
import { commentSchema } from "./comment.js";
const { Schema } = mongoose;

export const reviewSchema = new Schema(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        albumId: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        likedBy: {
            type: [Schema.Types.ObjectId], // User
            required: true,
            default: [],
            ref: "User",
        },
        comments: {
            type: [commentSchema],
            required: true,
            default: [],
            select: false,
        },
        rating: {
            type: albumRatingSchema, // See ./album-rating.js
            required: true,
        },
    },
    { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);
