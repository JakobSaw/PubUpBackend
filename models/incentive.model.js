const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const incentiveSchema = new Schema(
    {
        lokal_id: {
            type: String,
            required: true,
        },
        incentive_id: {
            type: String,
            required: true,
        },
        description_D: {
            type: String,
            required: true,
        },
        description_E: {
            type: String,
            required: true,
        },
        photo: {
            type: String,
        },
        repeat: {
            type: Boolean,
            required: true,
        },
        single_Start: {
            type: Number,
        },
        single_End: {
            type: Number,
        },
        weekdays: {
            type: Array,
        },
        initial_createdAt: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Incentive = mongoose.model("Incentive", incentiveSchema);

module.exports = Incentive;
