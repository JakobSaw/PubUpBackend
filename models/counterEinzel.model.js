const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const counterEinzelSchema = new Schema(
    {
        lokal_name: {
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
        language: {
            type: String,
            required: true,
        },
        locale: {
            type: String,
            required: true,
        },
        os_version: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const CounterEinzel = mongoose.model("counterEinzel", counterEinzelSchema);

module.exports = CounterEinzel;
