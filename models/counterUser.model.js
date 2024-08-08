const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const counterUserSchema = new Schema(
    {
        action: {
            type: String,
            required: true,
        },
        os_version: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const CounterUser = mongoose.model("CounterUser", counterUserSchema);

module.exports = CounterUser;
