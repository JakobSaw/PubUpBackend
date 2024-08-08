const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const pluSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        lokal_id: {
            type: String,
            required: true,
        },
        district: {
            type: String,
        },
        adress: {
            type: String,
            required: true,
        },
        plz: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
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
        wine: {
            type: Boolean,
            required: true,
        },
        cocktails: {
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
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
        plus: {
            type: Boolean,
            required: true,
        },
        rent: {
            type: Boolean,
        },
        link1: {
            type: String,
        },
        link2: {
            type: String,
        },
        instagram: {
            type: String,
        },
        website: {
            type: String,
        },
        wlan: {
            type: Boolean,
            required: true,
        },
        payment: {
            type: String,
            required: true,
        },
        beschreibungD: {
            type: String,
        },
        beschreibungE: {
            type: String,
        },
        openingHoursD: {
            type: String,
            required: true,
        },
        openingHoursE: {
            type: String,
            required: true,
        },
        user_id: {
            type: String,
            required: true,
        },
        verified: {
            type: Boolean,
            required: true,
        },
        breweries: {
            type: Array,
        },
        place_id: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Plu = mongoose.model("Plu", pluSchema);

module.exports = Plu;
