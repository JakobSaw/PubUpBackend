const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const globalMessageSchema = new Schema(
    {
        de: {
            type: String,
            required: true,
        },
        en: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const GlobalMessageV3 = mongoose.model("GlobalMessageV3", globalMessageSchema);

module.exports = GlobalMessageV3;
