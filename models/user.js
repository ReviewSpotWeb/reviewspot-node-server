import mongoose from "mongoose";
const { Schema } = mongoose;

export const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            maxlength: 50,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        role: {
            type: String,
            required: true,
            enum: ["general", "moderator"],
            default: "general",
        },
        bio: { type: String, default: "" },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = mongoose.model("User", userSchema);
