const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const mailSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    adress: {
      type: String,
      required: true,
    },
    nachricht: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Mail = mongoose.model("Mail", mailSchema);

module.exports = Mail;
