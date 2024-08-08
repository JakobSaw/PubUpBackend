const router = require("express").Router();
const axios = require("axios");
const Plu = require("../models/plu.model");
const User = require("../models/user.model");
const Kneipe = require("../models/kneipe.model");
const auth = require("../middleware/auth");
const authAddPlu = require("../middleware/authAddPlu");
const authCoordinates = require("../middleware/authCoordinates");
const FormData = require("form-data");
const sendMail = require("../utilities/sendMail");
const CounterEinzel = require("../models/counterEinzel.model");
const PubPhoto = require("../models/pubPhoto.model");
const sanitizeHTML = require("../utilities/sanitizeHTML");

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

// GET NUMBERS OF KNEIPEN
router.route("/number").get((req, res) => {
    Plu.find({ verified: true })
        .then((test) => res.json(test.length))
        .catch((err) => res.status(400).json("Err: " + err));
});

// GET PLUS KNEIPE BY USER ID
router.get("/byuserid", bouncer.block, auth, async (req, res) => {
    const pub = await Plu.findOne({ user_id: req.user });

    if (!pub) {
        return res
            .status(404)
            .json({ msgD: "Kneipe nicht gefunden", msgE: "Pub not found" });
    }
    bouncer.reset(req);
    return res.json(pub);
});

router.get("/coordinates", bouncer.block, authCoordinates, async (req, res) => {
    try {
        let { adress } = req.query;
        if (!adress || typeof adress !== "string")
            return res.status(404).json({
                error: true,
            });
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${adress}&key=${process.env.GOOGLE_API}`
        );
        let coordinates;
        if (
            Array.isArray(response.data.results) &&
            !!response.data.results.length
        ) {
            response.data.results.forEach((current) => {
                if (!coordinates) {
                    coordinates = current.geometry.location;
                }
            });
        }
        if (coordinates) {
            res.send(coordinates);
            bouncer.reset(req);
            return;
        }
        return res.status(404).json({
            error: true,
        });
    } catch (err) {
        return res.status(404).json({
            error: true,
        });
    }
});

router.post("/useradd", bouncer.block, auth, async (req, res) => {
    try {
        const newPlu = new Plu({
            ...req.body,
            plus: true,
            verified: false,
        });
        await newPlu.save();

        const { user_id } = req.body;

        // Change User
        let user = await User.findOne({ user_id: user_id });
        if (!user) {
            return res.status(404).json({
                error: true,
                msgD: "Nichts gefunden!",
                msgE: "Nothing found!",
            });
        }
        user = user._doc;
        user.entry_created = true;
        const changedUser = await User.findOneAndUpdate({ user_id }, user);
        if (!changedUser)
            return res.status(404).json({
                error: true,
                msgD: "Aktion nicht möglich",
                msgE: "Action not possible",
            });

        // Check Name
        const allKneipen = await Kneipe.find();
        const possibleNameMatches = [];
        allKneipen.forEach((current) => {
            if (
                current.name.toLowerCase().trim() ===
                req.body.name.toLowerCase().trim() &&
                current.city === req.body.city
            ) {
                possibleNameMatches.push(current);
            }
        });

        if (!!possibleNameMatches.length) {
            let stringForPossibleNameMatches = "";
            if (!stringForPossibleNameMatches) {
                stringForPossibleNameMatches +=
                    "<h2>------- Mögliche schon vorhandene Einträge -------</h2>";
            }
            possibleNameMatches.forEach((current) => {
                stringForPossibleNameMatches += `<h3>${current.name}</h3>`;
                stringForPossibleNameMatches += `<h3>${current.adress}</h3>`;
                stringForPossibleNameMatches += `<a href="https://testing-pubackend.herokuapp.com/plu/link?lokal_id=${req.body.lokal_id}&user_id=${user_id}&action=validate&password=${process.env.PUBPHOTO_LINKPW}&remove=${current._id}">Übernehmen</a>`;
            });
            await sendMail(
                "Neue Plus Location",
                `<div>
                        <h1>Eine neue Plus Location wurde hinzugefügt</h1>
                        <h2>Name: ${sanitizeHTML(req.body.name)}</h2>
                        <h2>Adresse: ${sanitizeHTML(req.body.adress)}</h2>
                        <h2>Username: ${sanitizeHTML(user.username)}</h2>
                        ${sanitizeHTML(stringForPossibleNameMatches)}
                        <h1>------- Plu Actions -------</h1>
                        <h2>Bestätigen</h2>
                        <a href="https://testing-pubackend.herokuapp.com/plu/link?lokal_id=${sanitizeHTML(
                    req.body.lokal_id
                )}&user_id=${sanitizeHTML(
                    user_id
                )}&action=validate&password=${process.env.PUBPHOTO_LINKPW
                }">Bestätigen</a>
                        <h2>Löschen</h2>
                        <a href="https://testing-pubackend.herokuapp.com/plu/link?lokal_id=${sanitizeHTML(
                    req.body.lokal_id
                )}&user_id=${sanitizeHTML(
                    user_id
                )}&action=delete&password=${process.env.PUBPHOTO_LINKPW
                }">Löschen</a>
                        <img src="${sanitizeHTML(req.body.link1)}" />
                        <img src="${sanitizeHTML(req.body.link2)}" />
                    <div>`
            );
        } else {
            await sendMail(
                "Neue Plus Location",
                `<div>
                        <h1>Eine neue Plus Location wurde hinzugefügt</h1>
                        <h2>Name: ${sanitizeHTML(req.body.name)}</h2>
                        <h2>Adresse: ${sanitizeHTML(req.body.adress)}</h2>
                        <h2>Username: ${sanitizeHTML(user.username)}</h2>
                        <h2>Mögliche schon vorhandene Einträge:</h2>
                        <h2>Bestätigen</h2>
                        <a href="https://testing-pubackend.herokuapp.com/plu/link?lokal_id=${sanitizeHTML(
                    req.body.lokal_id
                )}&user_id=${sanitizeHTML(
                    user_id
                )}&action=validate&password=${process.env.PUBPHOTO_LINKPW
                }">Bestätigen</a>
                        <h2>Löschen</h2>
                        <a href="https://testing-pubackend.herokuapp.com/plu/link?lokal_id=${sanitizeHTML(
                    req.body.lokal_id
                )}&user_id=${sanitizeHTML(
                    user_id
                )}&action=delete&password=${process.env.PUBPHOTO_LINKPW
                }">Löschen</a>
                        <img src="${sanitizeHTML(req.body.link1)}" />
                        <img src="${sanitizeHTML(req.body.link2)}" />
                    <div>`
            );
        }
        bouncer.reset(req);
        res.json({ success: true });
    } catch (err) {
        return res.status(400).json({
            error: true,
            err,
            msgD: "Hinzufügen nicht möglich",
            msgE: "It's not possible to create Plus Entry",
        });
    }
});

router.post("/photo", bouncer.block, auth, async (req, res) => {
    try {
        // console.log("req.body :>> ", req.body.img);
        // return res.json("Done");
        const image_Data = new FormData();
        image_Data.append("image", req.body.img);

        // console.log("image_Data :>> ", image_Data);

        let imgURL = await axios({
            method: "post",
            url: `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_KEY}`,
            data: image_Data,
            mimeType: "multipart/form-data",
        });
        imgURL = imgURL.data.data.display_url;
        console.log("imgURL :>> ", imgURL);
        if (!imgURL)
            return res.status(400).json({
                error: true,
                msgD: "Hinzufügen nicht möglich",
                msgE: "It's not possible to create Plus Entry",
            });
        bouncer.reset(req);
        return res.json(imgURL);
    } catch (err) {
        console.log("err :>> ", err);
        return res.status(400).json({
            error: true,
            err,
            msgD: "Hinzufügen nicht möglich",
            msgE: "It's not possible to create Plus Entry",
        });
    }
});

router.get("/all", bouncer.block, authAddPlu, async (req, res) => {
    Plu.find({ verified: true })
        .then((plu) => {
            bouncer.reset(req);
            res.json(plu);
        })
        .catch((err) => res.status(400).json("Err: " + err));
});

const moveInfosFromPubToPlus = async (remove, lokal_id) => {
    try {
        await Kneipe.findOneAndDelete({ _id: { $in: [remove] } });
        const allCounterEinzeln = await CounterEinzel.find({
            lokal_id: remove,
        });
        if (!!allCounterEinzeln.length) {
            for (const allCounterEinzel of allCounterEinzeln) {
                const correct = allCounterEinzel._doc;
                await CounterEinzel.findOneAndDelete({
                    _id: { $in: correct._id },
                });
                delete correct._id;
                const newCounterEinzel = new CounterEinzel({
                    ...correct,
                    lokal_id,
                });
                await newCounterEinzel.save();
            }
        }
        const allPubPhotos = await PubPhoto.find({ pub_id: remove });
        if (!!allPubPhotos.length) {
            for (const allPubPhoto of allPubPhotos) {
                const correct = allPubPhoto._doc;
                await PubPhoto.findOneAndDelete({
                    _id: { $in: correct._id },
                });
                delete correct._id;
                const newPubPhoto = new PubPhoto({
                    ...correct,
                    pub_id: lokal_id,
                });
                await newPubPhoto.save();
            }
        }
        return;
    } catch (err) {
        console.log("Something went wrong");
        return;
    }
};

router.get("/link", bouncer.block, async (req, res) => {
    try {
        const { lokal_id, password, action, user_id, remove } = req.query;
        if (password !== process.env.PUBPHOTO_LINKPW)
            return res.status(403).json("Unauthorized");
        if (action === "validate") {
            let current = await Plu.findOne({ lokal_id });
            current = current._doc;
            await Plu.findOneAndUpdate(
                { lokal_id },
                {
                    ...current,
                    verified: true,
                }
            );
            let currentUser = await User.findOne({ user_id });
            currentUser = currentUser._doc;
            await User.findOneAndUpdate(
                { user_id },
                {
                    ...currentUser,
                    entry_verified: true,
                }
            );
            // Check for Remove
            if (remove) {
                await moveInfosFromPubToPlus(remove, lokal_id);
            }
        } else {
            await Plu.findOneAndDelete({ lokal_id });
            await User.findOneAndDelete({ user_id });
        }
        bouncer.reset(req);
        return res.json(
            `Plus Location wurde ${action === "validate" ? "bestätigt" : "gelöscht"
            }`
        );
    } catch (err) {
        res.json(`Error: ${err}`);
    }
});
router.get("/moveInfo", bouncer.block, async (req, res) => {
    try {
        const { lokal_id, password, remove } = req.query;
        if (password !== process.env.PUBPHOTO_LINKPW)
            return res.status(403).json("Unauthorized");
        await moveInfosFromPubToPlus(remove, lokal_id);
        res.json("Done");
    } catch (err) {
        res.json(`Error: ${err}`);
    }
});

// PUT CHANGED PLUS KNEIPE
router.put("/", bouncer.block, auth, async (req, res) => {
    let currentPlu = await Plu.findOne({ lokal_id: req.body.lokal_id });
    currentPlu = currentPlu._doc;
    if (!currentPlu.verified)
        return res.status(404).json({
            msgD: "Kneipe wurde noch nicht verizifiert",
            msgE: "Location has not been verified",
        });
    const changedPlu = await Plu.findOneAndUpdate(
        { lokal_id: req.body.lokal_id },
        req.body
    );

    if (!changedPlu)
        return res
            .status(404)
            .json({ msgD: "Kneipe nicht gefunden", msgE: "Pub not found" });
    bouncer.reset(req);
    res.json({ success: true });
});

module.exports = router;
