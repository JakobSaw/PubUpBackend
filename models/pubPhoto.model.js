const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const pubPhotoSchema = new Schema(
    {
        pub_id: {
            type: String,
            required: true,
        },
        photo_id: {
            type: String,
        },
        imgURL: {
            type: String,
            required: true,
        },
        validated: {
            type: Boolean,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const PubPhoto = mongoose.model("pubPhoto", pubPhotoSchema);

module.exports = PubPhoto;
