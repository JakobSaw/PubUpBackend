const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const peopleSchema = new Schema(
    {
        userID: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        imgURL: {
            type: String,
            default: "https://i.ibb.co/bzQ4cK7/Default-IMG.jpg",
        },
        joined: {
            type: Number,
            required: true,
        },
        pub_ins: {
            type: Array,
            required: true,
        },
        friends: {
            type: Array,
            required: true,
        },
        pubs: {
            type: Array,
            required: true,
        },
        open_friends_requests: {
            type: Array,
            required: true,
        },
        interactions: {
            type: Array,
            required: true,
        },
        pubtours: {
            type: Array,
        },
        kneipenbachelor_activated: {
            type: Boolean,
        },
        city: {
            type: String,
        },
        highestAbschluss: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

const People = mongoose.model("People", peopleSchema);

module.exports = People;
