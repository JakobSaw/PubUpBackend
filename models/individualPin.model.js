const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const individualPinSchema = new Schema(
    {
        lokal_id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        adress: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        city2: {
            type: String,
        },
        category: {
            type: String,
            required: true,
        },
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
        breweries: {
            type: Array,
        },
        place_id: {
            type: String,
        },
        hours: {
            type: String,
        },
        extra: {
            type: Array,
        },
        hhlink: {
            type: String,
        },
        bierothek_link: {
            type: String,
        },
        bierothek: {
            type: Boolean,
        },
        instagram: {
            type: String,
        },
        website: {
            type: String,
        },
        img: {
            type: String,
        },
        smoking: {
            type: String,
            required: true,
        },
        outdoor: {
            type: Boolean,
            required: true,
        },
        darts: {
            type: Boolean,
            required: true,
        },
        billards: {
            type: Boolean,
            required: true,
        },
        kicker: {
            type: Boolean,
            required: true,
        },
        streaming: {
            type: Boolean,
            required: true,
        },
        kitchen: {
            type: String,
            required: true,
        },
        cocktails: {
            type: Boolean,
            required: true,
        },
        wine: {
            type: Boolean,
            required: true,
        },
        craft: {
            type: Boolean,
            required: true,
        },
        music: {
            type: Boolean,
            required: true,
        },
        test: {
            type: Boolean,
        },
    },
    {
        timestamps: true,
    }
);

const IndividualPin = mongoose.model("IndividualPin", individualPinSchema);

module.exports = IndividualPin;
