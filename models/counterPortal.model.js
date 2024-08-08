const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const counterPortalSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
        },
        user_id: {
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
        action: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const CounterPortal = mongoose.model("counterPortal", counterPortalSchema);

module.exports = CounterPortal;
