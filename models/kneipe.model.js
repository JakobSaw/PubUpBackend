const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const kneipeSchema = new Schema(
    {
        name: {
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
        district: {
            type: String,
        },
        adress: {
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
        latitude: {
            type: Number,
        },
        longitude: {
            type: Number,
        },
        breweries: {
            type: Array,
        },
        place_id: {
            type: String,
        },
        bierothek_link: {
            type: String,
        },
        website: {
            type: String,
        },
        instagram: {
            type: String,
        },
        description: {
            type: String,
        },
        img: {
            type: String,
        },
        nophoto: {
            type: Boolean,
        },
    },
    {
        timestamps: true,
    }
);

const Kneipe = mongoose.model("Kneipe", kneipeSchema);

module.exports = Kneipe;
