const router = require("express").Router();
let Message = require("../models/message.model");
const auth = require("../middleware/auth");
const crypto = require("crypto");
const bouncer = require("express-bouncer")(500, 1000000, 10);
const sendMail = require("../utilities/sendMail");
const sanitizeHTML = require("../utilities/sanitizeHTML");

// bouncer.block,

// In case we want to supply our own error (optional)
bouncer.blocked = function (req, res, next, remaining) {
    console.log("BOUNCER", remaining);
    res.send(
        429,
        "Too many requests have been made, " +
            "please wait " +
            remaining / 1000 +
            " seconds"
    );
};

// POST REQUEST ON THE MAIL ROUTER
router.post("/", bouncer.block, auth, async (req, res) => {
    const message = req.body.message;
    const id = req.body.id;

    const messageCreated = {
        message,
        user_id: id,
        responses: [],
        message_id: crypto.randomBytes(20).toString("hex"),
        sent: Date.now(),
    };

    const newMessage = new Message(messageCreated);

    await sendMail(
        "Neue Plus Nachricht",
        `<div>
            <h1>Eine Plus Frage wurde gestellt</h1>
            <p>Nachricht: ${sanitizeHTML(message)}</p>
            <p>Plus User ID: ${sanitizeHTML(id)}</p>
        <div>`
    );

    newMessage
        .save()
        .then(() => {
            bouncer.reset(req);
            res.json(messageCreated);
        })
        .catch((err) =>
            res.status(400).json({
                msgD: "Senden der Nachricht nicht möglich, bitte versuche es später nochmal",
                msgE: "It's not possible to send your message, please try later",
                err,
            })
        );
});
router.get("/", bouncer.block, auth, async (req, res) => {
    const messages = await Message.find({
        user_id: req.query.id,
    });

    if (!messages)
        return res.status(400).json({
            msgD: "Ein Fehler ist aufgetreten",
            msgE: "An Error occured",
        });
    bouncer.reset(req);
    res.json(messages);
});
router.put("/", bouncer.block, auth, async (req, res) => {
    try {
        await Message.findOneAndUpdate(
            {
                message_id: req.query.id,
            },
            req.body
        );
        await sendMail(
            "Neue Plus Nachricht",
            `<div>
                <h1>Eine neue Plus Nachricht wurde geschickt</h1>
                <p>Nachricht: ${sanitizeHTML(
                    req.body.responses[req.body.responses.length - 1].message
                )}</p>
                <p>Plus User ID: ${sanitizeHTML(req.body.user_id)}</p>
            <div>`
        );
        bouncer.reset(req);
        res.json("message changed!");
    } catch (err) {
        return res.status(400).json({
            msgD: "Ein Fehler ist aufgetreten",
            msgE: "An Error occured",
            err,
        });
    }
});
router.delete("/", bouncer.block, auth, async (req, res) => {
    try {
        await Message.findOneAndDelete({
            message_id: req.query.id,
        });
        bouncer.reset(req);
        res.json("message deleted!");
    } catch (err) {
        return res.status(400).json({
            msgD: "Ein Fehler ist aufgetreten",
            msgE: "An Error occured",
            err,
        });
    }
});

module.exports = router;
