const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ExtraFilterSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const ExtraFilter = mongoose.model("ExtraFilter", ExtraFilterSchema);

module.exports = ExtraFilter;
