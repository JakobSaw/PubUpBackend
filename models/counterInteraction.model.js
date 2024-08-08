const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const counterInteractionSchema = new Schema(
    {
        eventName: {
            type: String,
            required: true,
        },
        event_id: {
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

const CounterInteraction = mongoose.model(
    "counterInteraction",
    counterInteractionSchema
);

module.exports = CounterInteraction;
