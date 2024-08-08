const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const brewerySchema = new Schema(
    {
        brewery_id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
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

const Brewery = mongoose.model("brewery", brewerySchema);

module.exports = Brewery;
