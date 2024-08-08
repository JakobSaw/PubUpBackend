const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const codeSchema = new Schema(
    {
        code: {
            type: String,
            required: true,
        },
        partnerID: {
            type: String,
            required: true,
        },
        checkInID: {
            type: String,
            required: true,
        },
        once: {
            type: Boolean,
        },
    },
    {
        timestamps: true,
    }
);

const Code = mongoose.model("Code", codeSchema);

module.exports = Code;
