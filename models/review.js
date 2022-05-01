import mongoose from "mongoose";
import { albumRatingSchema } from "./album-rating.js";
import { commentSchema } from "./comment.js";
const { Schema } = mongoose;

export const reviewSchema = new Schema(
    {
        authorInfo: {
            authorId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            authorName: {
                type: String, // User.username
                required: true,
            },
            authorRole: {
                type: String, // User.role
                required: true,
            },
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
        numComments: {
            type: Number,
            required: true,
            default: 0,
        },
        rating: {
            type: albumRatingSchema, // See ./album-rating.js
            required: true,
        },
    },
    { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);
