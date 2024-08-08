const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const adminSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        english: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
