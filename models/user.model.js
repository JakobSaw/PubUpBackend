const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        user_id: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        lokalname: {
            type: String,
            required: true,
        },
        lokal_id: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        english: {
            type: Boolean,
            required: true,
        },
        entry_created: {
            type: Boolean,
            required: true,
        },
        entry_verified: {
            type: Boolean,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
