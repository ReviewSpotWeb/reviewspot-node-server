import mongoose from "mongoose";
const { Schema } = mongoose;

const spotifyTokenSchema = new Schema({
    expiresAt: Date,
    accessToken: String,
    tokenType: String,
});

export const SpotifyToken = mongoose.model("SpotifyToken", spotifyTokenSchema);
