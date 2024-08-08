const router = require("express").Router();
let CounterEinzel = require("../models/counterEinzel.model");
let CounterInteraction = require("../models/counterInteraction.model");
let Message = require("../models/message.model");
const auth = require("../middleware/auth");

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

// GET ALL INTERACTIONS FOR ONE
router.get("/byid", bouncer.block, auth, async (req, res) => {
    const queryID = req.query.id;

    const findEveryLokalInteraction = await CounterEinzel.find({
        lokal_id: queryID,
    });

    if (!findEveryLokalInteraction) {
        return res
            .status(404)
            .json({ msgD: "Es ist ein Fehler aufgetreten", msgE: "ERROR" });
    }

    const messages = await Message.find({
        user_id: req.query.user_id,
    });

    let newMessages = 0;

    messages.forEach((current) => {
        current.responses.forEach((currentMessage) => {
            if (currentMessage.unread && currentMessage.from === "pubup") {
                newMessages++;
            }
        });
    });

    bouncer.reset(req);
    res.json({
        allLokal: findEveryLokalInteraction.length,
        // allEvents: findEveryEventInteraction.length
        newMessages,
    });
});

router.get("/allInteractions", bouncer.block, auth, async (req, res) => {
    const queryID = req.query.id;

    const findEveryLokalInteraction = await CounterEinzel.find({
        lokal_id: queryID,
    });
    const findEveryEventInteraction = await CounterInteraction.find({
        lokal_id: queryID,
    });
    const find_lokal_favorite = await CounterEinzel.find({
        lokal_id: queryID,
        action: "like",
    });
    const find_lokal_clicks = await CounterEinzel.find({
        lokal_id: queryID,
        action: "clickOnIt",
    });
    const find_lokal_sharings = await CounterEinzel.find({
        lokal_id: queryID,
        action: "share",
    });
    const find_lokal_meetings = await CounterEinzel.find({
        lokal_id: queryID,
        action: "meeting",
    });
    const find_lokal_navigate = await CounterEinzel.find({
        lokal_id: queryID,
        action: "navigate",
    });
    const find_events_favorite = await CounterInteraction.find({
        lokal_id: queryID,
        action: "like",
    });
    const find_events_clicks = await CounterInteraction.find({
        lokal_id: queryID,
        action: "clickOnIt",
    });
    const find_events_sharings = await CounterInteraction.find({
        lokal_id: queryID,
        action: "share",
    });
    const find_events_meetings = await CounterInteraction.find({
        lokal_id: queryID,
        action: "meeting",
    });
    const find_events_navigate = await CounterInteraction.find({
        lokal_id: queryID,
        action: "navigate",
    });
    let find_incentives = await CounterEinzel.find({
        lokal_id: queryID,
    });
    /* const find_incentives = await CounterEinzel.find({
        lokal_id: queryID,
        action: "incentive",
    }); */
    const find_events_ticketslink = await CounterInteraction.find({
        lokal_id: queryID,
        action: "clickOnTicketsLink",
    });

    find_incentives = find_incentives.filter((c) =>
        c.action.startsWith("IncentiveClick:")
    );

    if (
        !findEveryLokalInteraction ||
        !findEveryEventInteraction ||
        !find_lokal_favorite ||
        !find_lokal_clicks ||
        !find_lokal_sharings ||
        !find_lokal_meetings ||
        !find_lokal_navigate ||
        !find_events_favorite ||
        !find_events_clicks ||
        !find_events_sharings ||
        !find_events_meetings ||
        !find_events_navigate ||
        !find_incentives ||
        !find_events_ticketslink
    ) {
        return res
            .status(404)
            .json({ msgD: "Es ist ein Fehler aufgetreten", msgE: "ERROR" });
    }

    const allNavgiates =
        find_lokal_navigate.length + find_events_navigate.length;
    bouncer.reset(req);
    res.json({
        allLokal: findEveryLokalInteraction.length,
        allEvents: findEveryEventInteraction.length,
        lokal_favorite: find_lokal_favorite.length,
        lokal_clicks: find_lokal_clicks.length,
        lokal_sharings: find_lokal_sharings.length,
        lokal_meetings: find_lokal_meetings.length,
        allNavgiates: allNavgiates,
        events_favorite: find_events_favorite.length,
        events_clicks: find_events_clicks.length,
        events_sharings: find_events_sharings.length,
        events_meetings: find_events_meetings.length,
        events_ticketslink: find_events_ticketslink.length,
        allIncentives: find_incentives.length,
        detailedIncentives: find_incentives,
    });
});

module.exports = router;
