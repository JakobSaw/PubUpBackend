const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const barBundleSchema = new Schema(
    {
        bb_id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        info: {
            type: String,
        },
        admin: {
            type: String,
            required: true,
        },
        public: {
            type: Boolean,
            required: true,
        },
        pubs: {
            type: Array,
            required: true,
        },
        pubCount: {
            type: Number,
            required: true,
            default: null,
        },
        imgURL: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const BarBundle = mongoose.model("barBundle", barBundleSchema);

module.exports = BarBundle;
