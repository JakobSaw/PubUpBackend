const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ExtraCategorySchema = new Schema(
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

const ExtraCategory = mongoose.model("ExtraCategory", ExtraCategorySchema);

module.exports = ExtraCategory;
