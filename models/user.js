import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        maxlength: 50,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["general", "moderator"],
        default: "general",
    },
    bio: String,
});

export const User = mongoose.model("User", userSchema);
