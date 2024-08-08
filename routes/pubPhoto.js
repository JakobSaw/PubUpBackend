const router = require("express").Router();
const PubPhoto = require("../models/pubPhoto.model");
const authPubPhoto = require("../middleware/authPubPhoto");
const auth = require("../middleware/auth");
const axios = require("axios");
const sendMail = require("../utilities/sendMail");
const FormData = require("form-data");
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

router.route("/new").post(bouncer.block, authPubPhoto, async (req, res) => {
    res.json("Done");
    try {
        const { imgURL, pub_id } = req.body;
        const noPlusPub = !pub_id.includes("-") || pub_id.substring(0, 3) === "ip-"
        bouncer.reset(req);
        const newPhotoID = Math.random();
        const newPubPhoto = new PubPhoto({
            pub_id,
            imgURL,
            photo_id: noPlusPub ? newPhotoID : null,
            validated: false,
        });
        await newPubPhoto.save();
        if (noPlusPub) {
            console.log("Send Mail");
            await sendMail(
                "Neues Photo",
                `<div>
                    <h1>Ein neues Foto wurde hochgeladen</h1>
                    <img src="${sanitizeHTML(imgURL)}" />
                    <h2>Bestätigen</h2>
                    <a href="https://testing-pubackend.herokuapp.com/pubPhoto/link?pub_id=${sanitizeHTML(
                    pub_id
                )}&photo_id=${newPhotoID}&action=validate&password=${process.env.PUBPHOTO_LINKPW
                }">Bestätigen</a>
                    <h2>Löschen</h2>
                    <a href="https://testing-pubackend.herokuapp.com/pubPhoto/link?pub_id=${sanitizeHTML(
                    pub_id
                )}&photo_id=${newPhotoID}&action=delete&password=${process.env.PUBPHOTO_LINKPW
                }">Löschen</a>
                <div>`
            );
        }
        return;
    } catch (err) {
        console.log("err :>> ", err);
        return;
        // return res.status(400).json({
        //     error: true,
        //     err,
        //     msgD: "Hinzufügen nicht möglich",
        //     msgE: "It's not possible to create Plus Entry",
        // });
    }
});
router.route("/get").post(bouncer.block, authPubPhoto, async (req, res) => {
    const findPubPhotos = await PubPhoto.find({
        pub_id: req.body.pub_id,
        validated: true,
    });
    bouncer.reset(req);
    res.json(findPubPhotos);
});

router.route("/link").get(bouncer.block, async (req, res) => {
    const { pub_id, photo_id, password, action } = req.query;
    if (password !== process.env.PUBPHOTO_LINKPW)
        return res.status(403).json("Unauthorized");
    if (action === "validate") {
        let current = await PubPhoto.findOne({ pub_id, photo_id });
        current = current._doc;
        await PubPhoto.findOneAndUpdate(
            { pub_id, photo_id },
            {
                ...current,
                photo_id: null,
                validated: true,
            }
        );
    } else {
        await PubPhoto.findOneAndDelete({ pub_id, photo_id });
    }
    bouncer.reset(req);
    res.json(`Foto wurde ${action === "validate" ? "bestätigt" : "gelöscht"}`);
});

router.route("/plus").get(bouncer.block, auth, async (req, res) => {
    const findPubPhotos = await PubPhoto.find({
        pub_id: req.query.pub_id,
    });
    bouncer.reset(req);
    res.json(findPubPhotos);
});
router.route("/").delete(bouncer.block, auth, async (req, res) => {
    await PubPhoto.findOneAndDelete({ _id: { $in: req.query.photo_id } });
    bouncer.reset(req);
    res.json("Done");
});
router.route("/").put(bouncer.block, auth, async (req, res) => {
    try {
        const findPubPhoto = await PubPhoto.findOne({
            _id: req.query.photo_id,
        });
        await PubPhoto.findOneAndUpdate(
            { _id: { $in: req.query.photo_id } },
            {
                ...findPubPhoto._doc,
                validated: req.body.validated,
            }
        );
        bouncer.reset(req);
        res.json("Done");
    } catch (err) {
        console.log("Errror", err);
        return res.status(400).json({
            error: true,
            err,
            msgD: "Ein Fehler sit aufgetreten",
            msgE: "An Error occured",
        });
    }
});

module.exports = router;
