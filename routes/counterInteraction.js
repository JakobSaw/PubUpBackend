const router = require("express").Router();
let CounterInteraction = require("../models/counterInteraction.model");

// POST REQUEST ON THE Counter INTERACTION
router.route("/").post((req, res) => {
    const eventName = req.body.eventName;
    const event_id = req.body.event_id;
    const lokal_id = req.body.lokal_id;
    const action = req.body.action;
    const language = req.body.language;
    const locale = req.body.locale;

    const newCounterInteraction = new CounterInteraction({
        eventName,
        event_id,
        lokal_id,
        action,
        language,
        locale,
    });

    newCounterInteraction
        .save()
        .then(() => res.json("added"))
        .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
