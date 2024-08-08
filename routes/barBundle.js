const router = require("express").Router();
const BarBundle = require("../models/barBundle.model");
const Kneipe = require("../models/kneipe.model");
const Plu = require("../models/plu.model");
const authBarBundle = require("../middleware/authBarBundle");
const sendMail = require("../utilities/sendMail");
const sanitizeHTML = require("../utilities/sanitizeHTML");

const bouncer = require("express-bouncer")(500, 1000000, 10);

// In case we want to supply our own error (optional)
bouncer.blocked = function (req, res, next, remaining) {
    console.log("BOUNCER", remaining, remaining);
    res.send(
        429,
        "Too many requests have been made, " +
            "please wait " +
            remaining / 1000 +
            " seconds"
    );
};

router.route("/add").post(bouncer.block, authBarBundle, async (req, res) => {
    const defaultURL = "https://i.ibb.co/6RqCCJJ/Banner-Default-1.jpg";

    const newBarBundle = new BarBundle({
        ...req.body,
        imgURL: req.body.imgURL || defaultURL,
    });

    if (req.body.public) {
        await sendMail(
            "Neues Öffentliches PubBundle",
            `<div>
                <h1>Eine neues Öffentliches PubBundle wurde hinzugefügt</h1>
                <h2>Name: ${sanitizeHTML(req.body.name)}</h2>
                <h2>Info: ${sanitizeHTML(req.body.info)}</h2>
                <h2>Löschen</h2>
                <a href="https://testing-pubackend.herokuapp.com/barbundle/link?bb_id=${sanitizeHTML(
                    req.body.bb_id
                )}&password=${process.env.PUBPHOTO_LINKPW}">Löschen</a>
                <img src="${sanitizeHTML(req.body.imgURL)}" />
            <div>`
        );
    }

    newBarBundle
        .save()
        .then(() => res.json("barBundle added!"))
        .catch((err) => {
            console.log(err);
            res.status(400).json({
                msgD: "Senden der Nachricht nicht möglich, bitte versuche es später nochmal",
                msgE: "It's not possible to send your message, please try later",
            });
        });
});

router.route("/link").get(bouncer.block, async (req, res) => {
    const { bb_id, password } = req.query;
    if (password !== process.env.PUBPHOTO_LINKPW)
        return res.status(403).json("Unauthorized");
    try {
        await BarBundle.findOneAndDelete({ bb_id });
        res.json("Erfolgreich gelöscht");
    } catch {
        res.json("Fehler beim LÖschen");
    }
});

// Get
router.route("/get").post(bouncer.block, authBarBundle, async (req, res) => {
    const collectBarBundles = new Array();

    try {
        const allKneipen = await Kneipe.find();
        const allPlu = await Plu.find({ verified: true });
        const allPlus = [];
        allPlu.forEach((current) => {
            const c = current;
            delete c.user_id;
            allPlus.push(c);
        });
        const allLocations = [...allPlus, ...allKneipen];
        if (Array.isArray(req.body)) {
            for (let i = 0; i < req.body.length; i++) {
                const current = req.body[i];
                let findBarBundle = await BarBundle.findOne({
                    bb_id: current,
                });
                if (findBarBundle) {
                    findBarBundle = findBarBundle._doc;
                    const collectPubs = [];
                    allLocations.forEach((cl) => {
                        if (
                            findBarBundle.pubs.indexOf(cl.lokal_id || cl._id) >
                            -1
                        ) {
                            collectPubs.push(cl);
                        }
                    });
                    findBarBundle.pubs = collectPubs;
                    collectBarBundles.push(findBarBundle);
                }
            }
            bouncer.reset(req);
            return res.json(collectBarBundles);
        } else {
            res.status(400).json({
                msgD: "Senden der Nachricht nicht möglich, bitte versuche es später nochmal",
                msgE: "It's not possible to send your message, please try later",
            });
        }
    } catch (err) {
        console.log("err :>> ", err);
        res.status(500).send({
            error: true,
            err,
        });
    }
});
router.route("/update").post(bouncer.block, authBarBundle, async (req, res) => {
    try {
        await BarBundle.findOneAndUpdate({ bb_id: req.body.bb_id }, req.body);
        if (req.body.public) {
            await sendMail(
                "Änderung an Öffentlichem PubBundle",
                `<div>
                    <h1>Ein Öffentliches PubBundle wurde geändert</h1>
                    <h2>Name: ${sanitizeHTML(req.body.name)}</h2>
                    <h2>Info: ${sanitizeHTML(req.body.info)}</h2>
                    <h2>Löschen</h2>
                    <a href="https://testing-pubackend.herokuapp.com/barbundle/link?bb_id=${sanitizeHTML(
                        req.body.bb_id
                    )}&password=${process.env.PUBPHOTO_LINKPW}">Löschen</a>
                    <img src="${sanitizeHTML(req.body.imgURL)}" />
                <div>`
            );
        }
        bouncer.reset(req);
        res.json("Done");
    } catch (err) {
        console.log("err :>> ", err);
        res.status(500).send({
            error: true,
            err,
        });
    }
});
router.route("/delete").post(bouncer.block, authBarBundle, async (req, res) => {
    const deleteBarBundle = await BarBundle.findOneAndDelete({
        bb_id: req.body.bb_id,
    });

    if (!deleteBarBundle) {
        return res.status(400).json("Löschung nicht möglich");
    }
    bouncer.reset(req);
    res.json("Done");
});
router.route("/public").get(bouncer.block, authBarBundle, async (req, res) => {
    const findBarBundles = await BarBundle.find({ public: true });
    bouncer.reset(req);
    res.json(findBarBundles);
});
router.route("/bypub").get(bouncer.block, authBarBundle, async (req, res) => {
    const { id } = req.query;
    const findBarBundles = await BarBundle.find({ public: true });
    const allPubBundles = findBarBundles.filter((current) => {
        if (current.pubs.indexOf(id) > -1) {
            return current;
        }
    });
    bouncer.reset(req);
    res.json(allPubBundles);
});

module.exports = router;
