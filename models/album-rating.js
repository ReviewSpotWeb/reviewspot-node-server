import mongoose from "mongoose";
const { Schema } = mongoose;

const albumRatingSchema = new Schema({
    rater: { type: mongoose.ObjectId, required: true }, // User
    rating: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
    },
});

export const AlbumRating = mongoose.model("AlbumRating", albumRatingSchema);
