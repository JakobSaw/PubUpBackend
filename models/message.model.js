const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        message: {
            type: String,
            required: true,
        },
        user_id: {
            type: String,
            required: true,
        },
        responses: {
            type: Array,
            required: true,
        },
        message_id: {
            type: String,
            required: true,
        },
        sent: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
