const router = require("express").Router();
let Kneipe = require("../models/kneipe.model");
const authGetKneipe = require("../middleware/authGetKneipe");
const auth = require("../middleware/auth");
let Plu = require("../models/plu.model");
let Admin = require("../models/admin.model");
const bouncer = require("express-bouncer")(500, 1000000, 10);
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Veranstaltung = require("../models/veranstaltung.model");
const authLocal = require("../middleware/authLocal");
const IndividualPin = require("../models/individualPin.model");

// bouncer.block,

bouncer.whitelist.push("::1");

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
router.route("/add").post(bouncer.block, authLocal, auth, async (req, res) => {
    try {
        const { username, password, type } = req.body;

        if (!username || !password || !type) {
            return res.json({ error: true, err: "Es fehlen Felder" });
        }

        // Hash the Password
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newAdmin = new Admin({
            username,
            password: passwordHash,
            type,
        });

        const token = jwt.sign({ id: username }, process.env.JWT_PW);

        newAdmin
            .save()
            .then(() => {
                bouncer.reset(req);
                res.json({
                    success: true,
                    token,
                    user: {
                        username,
                        type,
                    },
                });
            })
            .catch((err) => res.json({ error: true, err }));
    } catch (err) {
        res.json({ error: true, err });
    }
});
router.route("/check").post(bouncer.block, authGetKneipe, async (req, res) => {
    try {
        const { check } = req.body;
        let allPubs = await Kneipe.find();
        const allPlus = await Plu.find();
        const allIPs = await IndividualPin.find();
        allPubs = [...allPubs, ...allPlus, ...allIPs];
        let string = "Vorhandene Einträge  |  ";
        allPubs.forEach((current) => {
            if (current.name.toLowerCase().includes(check.toLowerCase())) {
                string += `${current.name} / `;
                string += `${current.adress}  /  `;
                string += `${current.lokal_id || current._id}  |  `;
            }
        });
        bouncer.reset(req);
        res.json(string);
    } catch (err) {
        res.json(`Error: ${err}`);
    }
});
router.route("/login").post(bouncer.block, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            error: true,
            msgD: "Nicht alle Felder ausgefüllt",
            msgE: "Not all fields have been entered",
        });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
        return res.status(400).json({
            error: true,
            msgD: "Es wurde kein Account unter diesem Username gefunden",
            msgE: "No Account with this username has been registered",
        });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
        return res.status(400).json({
            error: true,
            msgD: "Ungültige Login Daten",
            msgE: "Invalid Login Data",
        });
    }

    const token = jwt.sign({ id: admin.username }, process.env.JWT_PW);

    const returnAdmin = {
        ...admin._doc,
    };
    delete returnAdmin.password;
    delete returnAdmin.__v;
    delete returnAdmin.updatedAt;
    delete returnAdmin.createdAt;
    delete returnAdmin._id;

    if (returnAdmin.type === "studenta") {
        const allKneipen = await Kneipe.find();
        const allPlu = await Plu.find({ verified: true });
        let allPlus = [];
        allPlu.forEach((current) => {
            const c = current;
            delete c.user_id;
            allPlus.push(c);
        });
        const allPubs = [...allPlus, ...allKneipen];
        const collectPubs = [];
        allPubs.forEach((c) => {
            collectPubs.push({
                name: c.name,
                pub_id: c.lokal_id || c._id,
                city: c.city !== "World" ? c.city : c.city2 || c.extracity,
            });
        });
        returnAdmin.kneipen = collectPubs;
        const findVeranstaltungen = await Veranstaltung.find({
            category: "pubtour",
        });
        returnAdmin.veranstaltungen = findVeranstaltungen;
    }

    bouncer.reset(req);
    return res.json({
        token,
        admin: returnAdmin,
    });
});
router.get("/tokenisValid", bouncer.block, async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            return res.json(false);
        }
        const verified = jwt.verify(token, process.env.JWT_PW);
        if (!verified) {
            return res.json(false);
        }
        const admin = await Admin.find({ username: verified.id });
        if (!admin.length) {
            return res.json(false);
        }
        bouncer.reset(req);
        return res.json(true);
    } catch (err) {
        console.log("err :>> ", err);
        res.status(500).json({
            error: true,
            msgD: "Opps, da ist was schief gegangen, bitte versuche es nochmal",
            msgE: "Opps, something went wrong, please try again",
        });
    }
});
router.get("/", bouncer.block, auth, async (req, res) => {
    const user = await Admin.findOne({ username: req.user });
    if (!user)
        return res.status(400).json({
            msgD: "Es wurde kein Account unter dieser Mail gefunden",
            msgE: "No Account with this email has been registered",
        });
    const returnAdmin = {
        ...user._doc,
    };
    delete returnAdmin.password;
    delete returnAdmin.__v;
    delete returnAdmin.updatedAt;
    delete returnAdmin.createdAt;
    delete returnAdmin._id;

    if (returnAdmin.type === "studenta") {
        const allKneipen = await Kneipe.find();
        const allPlu = await Plu.find({ verified: true });
        let allPlus = [];
        allPlu.forEach((current) => {
            const c = current;
            delete c.user_id;
            allPlus.push(c);
        });
        const allPubs = [...allPlus, ...allKneipen];
        const collectPubs = [];
        allPubs.forEach((c) => {
            collectPubs.push({
                name: c.name,
                pub_id: c.lokal_id || c._id,
                city: c.city !== "World" ? c.city : c.city2 || c.extracity,
            });
        });
        returnAdmin.kneipen = collectPubs;
        const findVeranstaltungen = await Veranstaltung.find({
            category: "pubtour",
        });
        returnAdmin.veranstaltungen = findVeranstaltungen;
    }

    bouncer.reset(req);
    res.json(returnAdmin);
});

module.exports = router;
