import mongoose from "mongoose";
import { Schema } from "mongoose";

const spotifyTokenSchema = new Schema({
    expiresAt: Date,
    access_token: String,
    token_type: String,
});

export const SpotifyToken = mongoose.model("SpotifyToken", spotifyTokenSchema);
