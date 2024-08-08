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
        }
    },
    {
        timestamps: true,
    }
);

const GlobalMessage = mongoose.model("GlobalMessage", globalMessageSchema);

module.exports = GlobalMessage
