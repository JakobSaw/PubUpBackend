const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bytesCheckSchema = new Schema(
    {
        url: {
            type: String,
            required: true,
        },
        bytes: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const BytesCheck = mongoose.model("bytesCheck", bytesCheckSchema);

module.exports = BytesCheck;
