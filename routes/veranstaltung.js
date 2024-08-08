const router = require("express").Router();
const authAllPubs = require("../middleware/authAllPubs");
const Veranstaltung = require("../models/veranstaltung.model");

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
router.route("/").get(bouncer.block, authAllPubs, async (req, res) => {
    try {
        const { veranstaltung_id } = req.query;
        let findVeranstaltung = await Veranstaltung.findOne({
            veranstaltung_id,
        });
        if (!findVeranstaltung)
            return res.send({
                notfound: true,
            });
        findVeranstaltung = findVeranstaltung._doc;
        bouncer.reset(req);
        return res.json(findVeranstaltung);
    } catch (err) {
        console.log("err :>> ", err);
        res.send({
            error: true,
            err,
        });
    }
});
router.route("/pubtour").get(bouncer.block, authAllPubs, async (req, res) => {
    try {
        const findVeranstaltungen = await Veranstaltung.find({
            category: "pubtour",
        });
        bouncer.reset(req);
        return res.json(
            findVeranstaltungen.filter((c) => c.start + 86400000 > Date.now())
        );
    } catch (err) {
        console.log("err :>> ", err);
        res.send({
            error: true,
            err,
        });
    }
});
/* router.route("/").post(bouncer.block, authAllPubs, async (req, res) => {
    try {
        const newVeranstaltung = new Veranstaltung(req.body);
        await newVeranstaltung.save();
        bouncer.reset(req);
        return res.json("Done");
    } catch (err) {
        console.log("err :>> ", err);
        res.send({
            error: true,
            err,
        });
    }
}); */

module.exports = router;
