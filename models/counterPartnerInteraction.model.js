const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const counterPartnerInteractionSchema = new Schema(
    {
        partner_id: {
            type: String,
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        item: {
            type: Boolean,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const CounterPartnerInteraction = mongoose.model(
    "counterPartnerInteraction",
    counterPartnerInteractionSchema
);

module.exports = CounterPartnerInteraction;
