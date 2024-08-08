const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const veranstaltungSchema = new Schema(
    {
        veranstaltung_id: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        info_deu: {
            type: String,
        },
        info_eng: {
            type: String,
        },
        start: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        imgURL: {
            type: String,
            required: true,
        },
        city: {
            type: String,
        },
        district: {
            type: String,
        },
        lokal_id: {
            type: String,
        },
        ticket_link: {
            type: String,
            default: "https://studenta.ticket.io",
        },
        starting_times: {
            type: Array,
        },
        starting_interval: {
            type: String,
            default: "half",
        },
        duration: {
            type: Number,
            default: 5,
        },
        locations: {
            type: Array,
        },
        special_locations: {
            type: Array,
        },
        validation_location: {
            type: String,
        },
        end_location: {
            type: String,
        },
        individual_validation_location: {
            type: Object,
        },
        locations_needed: {
            type: Object,
        },
    },
    {
        timestamps: true,
    }
);

const Veranstaltung = mongoose.model("Veranstaltung", veranstaltungSchema);

module.exports = Veranstaltung;
