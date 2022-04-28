import mongoose from "mongoose";
const { Schema } = mongoose;

const albumRatingSchema = new Schema({
    rater: { type: mongoose.ObjectId, required: true }, // User
    albumId: { type: String, required: true },
    rating: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
    },
});

export const AlbumRating = mongoose.model("AlbumRating", albumRatingSchema);
