const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const counterBBInteractionSchema = new Schema(
    {
        bb_id: {
            type: String,
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const CounterBBInteraction = mongoose.model(
    "counterBBInteraction",
    counterBBInteractionSchema
);

module.exports = CounterBBInteraction;
