const router = require("express").Router();
const Incentive = require("../models/incentive.model");
const Plu = require("../models/plu.model");
const auth = require("../middleware/auth");
const authIncentive = require("../middleware/authIncentive");

const bouncer = require("express-bouncer")(500, 1000000, 10);

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

// Functions
const findCurrentIncentives = (allIncentives, pushFullIncentive) => {
    const allCurrentIncentivesIDs = [];

    allIncentives.forEach((current) => {
        if (current.repeat) {
            const currentDate = new Date();
            const currentDay = currentDate.getDay();
            const currentTime = parseInt(
                `${
                    currentDate.getHours() < 10
                        ? `0${currentDate.getHours()}`
                        : currentDate.getHours()
                }${
                    currentDate.getMinutes() < 10
                        ? `0${currentDate.getMinutes()}`
                        : currentDate.getMinutes()
                }`
            );
            const currentDayIncentive = current.weekdays[currentDay];
            if (
                typeof currentDayIncentive === "string" &&
                allCurrentIncentivesIDs.indexOf(current.lokal_id) < 0
            ) {
                allCurrentIncentivesIDs.push(
                    pushFullIncentive ? current : current.lokal_id
                );
            } else if (
                Array.isArray(currentDayIncentive) &&
                !!currentDayIncentive.length
            ) {
                currentDayIncentive.forEach((inc) => {
                    // console.log("currentTime :>> ", currentTime);
                    // console.log("current :>> ", inc[0]);
                    // console.log("currentDayIncentive[index + 1] :>> ", inc[1]);
                    let start = inc[0];
                    let end = inc[1];
                    if (start > end) {
                        start = inc[1];
                        end = inc[0];
                    }
                    if (
                        currentTime >= start &&
                        currentTime <= end &&
                        ((!pushFullIncentive &&
                            allCurrentIncentivesIDs.indexOf(current.lokal_id) <
                                0) ||
                            (pushFullIncentive &&
                                !allCurrentIncentivesIDs.some(
                                    (c) =>
                                        c.incentive_id === current.incentive_id
                                )))
                    ) {
                        allCurrentIncentivesIDs.push(
                            pushFullIncentive ? current : current.lokal_id
                        );
                    }
                });
            }
        } else {
            let currentUnix = Date.now();
            if (
                Date.now().toString().length >
                current.single_Start.toString().length
            ) {
                currentUnix = currentUnix / 1000;
            }
            if (
                currentUnix > current.single_Start &&
                currentUnix < current.single_End &&
                allCurrentIncentivesIDs.indexOf(current.lokal_id) < 0
            ) {
                allCurrentIncentivesIDs.push(
                    pushFullIncentive ? current : current.lokal_id
                );
            }
        }
    });

    return allCurrentIncentivesIDs;
};

// Post
router.post("/", bouncer.block, auth, async (req, res) => {
    let currentPlu = await Plu.findOne({ lokal_id: req.body.lokal_id });
    currentPlu = currentPlu._doc;
    if (!currentPlu.verified)
        return res.status(404).json({
            msgD: "Kneipe wurde noch nicht verizifiert",
            msgE: "Location has not been verified",
        });
    const newIncentive = new Incentive({
        ...req.body,
        initial_createdAt: Date.now(),
    });
    bouncer.reset(req);
    newIncentive
        .save()
        .then(() => res.json("incentive added!"))
        .catch((err) =>
            res.status(400).json({
                msgD: "Speichern nicht möglich!",
                msgE: "It's not possible to save the Incentive",
            })
        );
});

// GET
router.get("/withid", bouncer.block, authIncentive, async (req, res) => {
    const id = req.query.id;
    const allIncentives = await Incentive.find({ lokal_id: id });
    const findAll = findCurrentIncentives(allIncentives, true);
    bouncer.reset(req);
    return res.send(findAll);
});
router.get("/withuser", bouncer.block, auth, async (req, res) => {
    const id = req.query.id;
    Incentive.find({ lokal_id: id })
        .then((event) => {
            bouncer.reset(req);
            res.json(event);
        })
        .catch((err) =>
            res
                .status(400)
                .json({ msgD: "Kneipe nicht gefunden", msgE: "Pub not found" })
        );
});

// Delete
router.delete("/", bouncer.block, auth, async (req, res) => {
    const incentive_id = req.query.id;

    const deleteIncentive = await Incentive.findOneAndDelete({
        incentive_id: incentive_id,
    });

    if (!deleteIncentive) {
        return res.status(404).json({
            msgD: "Löschen nicht möglich",
            msgE: "It's not possible to delete",
        });
    } else {
        res.json("incentive deleted");
    }
});

// Change
router.put("/", bouncer.block, auth, async (req, res) => {
    const changedIncentive = await Incentive.findOneAndUpdate(
        { incentive_id: req.body.incentive_id },
        req.body
    );
    if (!changedIncentive)
        return res
            .status(404)
            .json({ msgD: "Kneipe nicht gefunden", msgE: "Pub not found" });
    bouncer.reset(req);
    res.json("Done");
});

module.exports = router;
