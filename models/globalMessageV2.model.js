const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const globalMessageSchema = new Schema(
    {
        message_D: {
            type: String,
            required: true,
        },
        message_E: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const GlobalMessageV2 = mongoose.model("GlobalMessageV2", globalMessageSchema);

module.exports = GlobalMessageV2;
