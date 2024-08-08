const router = require("express").Router();
let CounterPortal = require("../models/counterPortal.model");
const auth = require("../middleware/auth");

// POST REQUEST ON THE Counter Einzel ROUTER
router.post("/", auth, (req, res) => {
    const newCounterEinzel = new CounterPortal(req.body);

    newCounterEinzel
        .save()
        .then(() => res.json("Interaction added!"))
        .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
