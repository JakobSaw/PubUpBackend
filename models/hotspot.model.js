const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const hotspotSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        district: {
            type: String,
        },
        district2: {
            type: String,
        },
        category: {
            type: String,
            required: true,
        },
        latitude: {
            type: Number,
        },
        longitude: {
            type: Number,
        },
        text: {
            type: String,
        },
        city: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Hotspot = mongoose.model("Hotspot", hotspotSchema);

module.exports = Hotspot;
