const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const newEntrieSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        extracity: {
            type: String,
            required: false,
        },
        adress: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        extracategory: {
            type: String,
            required: false,
        },
        extrafilter: {
            type: String,
            required: false,
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
        fromWhere: {
            type: String,
            required: true,
        },
        once_id: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const NewEntrie = mongoose.model("NewEntrie", newEntrieSchema);

module.exports = NewEntrie;
