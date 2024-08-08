const router = require("express").Router();
const Kneipe = require("../models/kneipe.model");
const authGetKneipe = require("../middleware/authGetKneipe");
const Plu = require("../models/plu.model");
const PubPhoto = require("../models/pubPhoto.model");
const BarBundle = require("../models/barBundle.model");
const IndividualPin = require("../models/individualPin.model");

const bouncer = require("express-bouncer")(500, 1000000, 10);

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

// GET NUMBERS OF KNEIPEN
router.route("/number").get((req, res) => {
    Kneipe.find()
        .then((test) => res.json(test.length))
        .catch((err) => res.status(400).json("Err: " + err));
});

// GET KNEIPEN BY ID | ALSO PLUS!
router.route("/withid").get(bouncer.block, authGetKneipe, async (req, res) => {
    try {
        const queryID = req.query.id;
        let findPub;
        if (queryID.includes("-") && queryID.substring(0, 3) !== "ip-") {
            findPub = await Plu.findOne({ lokal_id: queryID, verified: true });
        } else if (queryID.substring(0, 3) === "ip-") {
            findPub = await IndividualPin.findOne({ lokal_id: queryID });
        } else {
            findPub = await Kneipe.findOne({ _id: queryID });
        }
        if (!findPub) {
            return res.status(500), json("Error");
        }
        findPub = findPub._doc;
        const pubPhotos = await PubPhoto.find({
            queryID,
            validated: true,
        });
        let barBundles = await BarBundle.find({ public: true });
        barBundles = barBundles.filter((current) => {
            if (current.pubs.indexOf(queryID) > -1) {
                return current;
            }
        });
        bouncer.reset(req);
        findPub.photos = pubPhotos || [];
        findPub.bundles = barBundles || [];
        return res.json(findPub);
    } catch (err) {
        console.log("err :>> ", err);
        res.status(500).json("Error");
    }
});

// Add Brewery to Pubs
router
    .route("/brewery")
    .post(bouncer.block, authGetKneipe, async (req, res) => {
        const { IDs, brewery } = req.body;
        try {
            for (const ID of IDs) {
                if (ID.includes("-") && ID.substring(0, 3) !== "ip-") {
                    let current = await Plu.findOne({ lokal_id: ID });
                    current = current._doc;
                    if (!current.breweries) {
                        current = {
                            ...current,
                            breweries: [brewery],
                        };
                    } else {
                        current = {
                            ...current,
                            breweries: [...current.breweries, brewery],
                        };
                    }
                    await Plu.findOneAndUpdate({ lokal_id: ID }, current);
                } else if (ID.substring(0, 3) === "ip-") {
                    let current = await IndividualPin.findOne({ lokal_id: ID });
                    current = current._doc;
                    if (!current.breweries) {
                        current = {
                            ...current,
                            breweries: [brewery],
                        };
                    } else {
                        current = {
                            ...current,
                            breweries: [...current.breweries, brewery],
                        };
                    }
                    await IndividualPin.findOneAndUpdate(
                        { lokal_id: ID },
                        current
                    );
                } else {
                    let current = await Kneipe.findById(ID);
                    current = current._doc;
                    if (!current.breweries) {
                        current = {
                            ...current,
                            breweries: [brewery],
                        };
                    } else {
                        current = {
                            ...current,
                            breweries: [...current.breweries, brewery],
                        };
                    }
                    await Kneipe.findOneAndUpdate(
                        { _id: { $in: [ID] } },
                        current
                    );
                }
            }
            bouncer.reset(req);
            return res.json("Hello");
        } catch (err) {
            console.log("err :>> ", err);
            res.json("Fehler");
        }
    });

// Add Brewery
router
    .route("/brewery/add")
    .post(bouncer.block, authGetKneipe, async (req, res) => {
        try {
            bouncer.reset(req);
            return res.json("Done");
        } catch (err) {
            console.log("err :>> ", err);
            res.json("Fehler");
        }
    });

module.exports = router;
