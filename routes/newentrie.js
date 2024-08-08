const router = require("express").Router();
const NewEntrie = require("../models/newentrie.model");
const ExtraFilter = require("../models/extraFilter.model");
const ExtraCategory = require("../models/extraCategory.model");
const axios = require("axios");
const Kneipe = require("../models/kneipe.model");
const authAddPlu = require("../middleware/authAddPlu");
const bouncer = require("express-bouncer")(500, 1000000, 10);
const sendMail = require("../utilities/sendMail");
const sanitizeHTML = require("../utilities/sanitizeHTML");

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

// POST REQUEST ON THE KNEIPE ROUTER
router.route("/").post(async (req, res) => {
    const name = req.body.name;
    const city = req.body.city || "See ExtraCity";
    const extracity = req.body.extracity;
    const category = req.body.category;
    const extracategory = req.body.extracategory;
    const extrafilter = req.body.extrafilter;
    const smoking = req.body.smoking;
    const outdoor = req.body.outdoor;
    const darts = req.body.darts;
    const billards = req.body.billards;
    const kicker = req.body.kicker;
    const streaming = req.body.streaming;
    const kitchen = req.body.kitchen;
    const cocktails = req.body.cocktails;
    const wine = req.body.wine;
    const craft = req.body.craft;
    const music = req.body.music;
    const latitude = 1;
    const longitude = 1;
    const adress = "Adresse einfügen";
    const fromWhere = req.body.fromWhere;
    const once_id = Math.random();

    const newNewEntrie = new NewEntrie({
        name,
        city,
        extracity,
        adress: "Adresse einfügen",
        category,
        extracategory,
        extrafilter,
        smoking,
        outdoor,
        darts,
        billards,
        kicker,
        streaming,
        kitchen,
        cocktails,
        wine,
        craft,
        music,
        latitude,
        longitude,
        fromWhere,
        once_id,
    });

    await sendMail(
        "Neue Location",
        `<div>
            <h1>Eine neue Location wurde hinzugefügt</h1>
            <p>Name: ${sanitizeHTML(name)}</p>
            <p>City: ${sanitizeHTML(city)}</p>
            <p>ExtraCity: ${sanitizeHTML(extracity)}</p>
            <p>ExtraCategory: ${sanitizeHTML(extracategory)}</p>
            <p>ExtraFilter: ${sanitizeHTML(extrafilter)}</p>
            <h2>Löschen</h2>
            <a href="https://testing-pubackend.herokuapp.com/newentrie/link?once_id=${once_id}&password=${process.env.PUBPHOTO_LINKPW
        }">Löschen</a>
        <div>`
    );

    newNewEntrie
        .save()
        .then(() => res.json("new Entrie added!"))
        .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/").get(bouncer.block, authAddPlu, async (req, res) => {
    const allNewEntries = await NewEntrie.find();
    let extraCategoryCounter = 0;

    try {
        for (const newEntrie of allNewEntries) {
            if (newEntrie.adress !== "Adresse einfügen") {
                const response = await axios.get(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${newEntrie.adress}&key=${process.env.GOOGLE_API}`
                );
                let coordinates;
                let correctDistrict;
                if (
                    Array.isArray(response.data.results) &&
                    !!response.data.results.length
                ) {
                    response.data.results.forEach((current) => {
                        current.address_components.forEach((c) => {
                            if (
                                c.types.indexOf("sublocality") > -1 ||
                                c.types.indexOf("locality") > -1
                            ) {
                                correctDistrict =
                                    c.long_name.indexOf("Bezirk") > -1
                                        ? c.long_name.substring(
                                            c.long_name.indexOf("Bezirk") + 7,
                                            c.long_name.length
                                        )
                                        : c.long_name;
                            }
                        });
                        if (!coordinates) {
                            coordinates = current.geometry.location;
                        }
                    });
                }
                if (coordinates && correctDistrict) {
                    const correctNewEntrie = newEntrie._doc;
                    const newPub = {
                        ...correctNewEntrie,
                        city: !!correctNewEntrie.extracity
                            ? "World"
                            : correctNewEntrie.city,
                        city2: !!correctNewEntrie.extracity
                            ? correctNewEntrie.extracity
                            : null,
                        latitude: coordinates.lat,
                        longitude: coordinates.lng,
                        district: correctDistrict,
                    };
                    delete newPub.extracity;
                    if (newPub.extrafilter) {
                        const newExtraFilter = new ExtraFilter({
                            name: newPub.extrafilter,
                        });
                        await newExtraFilter.save();
                    }
                    delete newPub.extrafilter;
                    delete newPub.fromWhere;
                    delete newPub.once_id;
                    if (newPub.city !== "World") {
                        delete newPub.city2;
                    } else {
                        delete newPub.district;
                    }
                    if (!newPub.extracategory) {
                        if (newPub.city === "World") {
                            newPub.category = `world${newPub.category}`;
                        }
                        delete newPub.extracategory;
                        // SavePub
                        const setNewPub = new Kneipe(newPub);
                        await setNewPub.save();
                        await NewEntrie.findOneAndDelete({
                            _id: { $in: newEntrie._id },
                        });
                    } else {
                        const newExtraCategory = new ExtraCategory({
                            name: newPub.extracategory,
                        });
                        await newExtraCategory.save();
                        extraCategoryCounter++;
                    }
                }
            }
        }
        if (!extraCategoryCounter) {
            return res.json("Done");
        } else {
            return res.json(
                `Done with ${extraCategoryCounter} newEntries left with ExtraCategory`
            );
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

router.route("/link").get(bouncer.block, async (req, res) => {
    const { once_id, password } = req.query;
    if (password !== process.env.PUBPHOTO_LINKPW)
        return res.status(403).json("Unauthorized");
    try {
        await NewEntrie.findOneAndDelete({ once_id });
        res.json("Erfolgreich gelöscht");
    } catch {
        res.json("Fehler beim LÖschen");
    }
});

module.exports = router;
