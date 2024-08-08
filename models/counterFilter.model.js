const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const counterFilterSchema = new Schema(
    {
        filters: {
            type: Object,
            required: true,
        },
        activeCity: {
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

const CounterFilter = mongoose.model("counterFilter", counterFilterSchema);

module.exports = CounterFilter;
