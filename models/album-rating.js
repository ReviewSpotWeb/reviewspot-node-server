import mongoose from "mongoose";
const { Schema } = mongoose;

export const albumRatingSchema = new Schema({
    rater: { type: Schema.Types.ObjectId, required: true }, // User
    albumId: { type: String, required: true },
    rating: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
    },
});

export const AlbumRating = mongoose.model("AlbumRating", albumRatingSchema);
