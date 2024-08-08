const router = require("express").Router();
const CounterEinzel = require("../models/counterEinzel.model");
const CounterFilter = require("../models/counterFilter.model");
const CounterBBInteraction = require("../models/counterBBInteraction.model");
const CounterInteraction = require("../models/counterInteraction.model");
const CounterPartnerInteraction = require("../models/counterPartnerInteraction.model");
const CounterUser = require("../models/counterUser.model");
const NewEntrie = require("../models/newentrie.model");
const GlobalMessageV3 = require("../models/globalMessageV3.model");
const Kneipe = require("../models/kneipe.model");
const Hotspot = require("../models/hotspot.model");
const Plu = require("../models/plu.model");
const authAllPubs = require("../middleware/authAllPubs");
const authLocal = require("../middleware/authLocal");
const authGlobalMessage = require("../middleware/authGlobalMessage");
const authBarBundle = require("../middleware/authBarBundle");
const Mail = require("../models/mail.model");
const PubPhoto = require("../models/pubPhoto.model");
const BarBundle = require("../models/barBundle.model");
const sendMail = require("../utilities/sendMail");
const sanitizeHTML = require("../utilities/sanitizeHTML");
const replaceAll = require("../utilities/replaceAll");
const checkNames = require("../utilities/checkNames");
const removeHTMLTags = require("../utilities/removeTags");
const sendPushNotifications = require("../utilities/sendPushNotifications");
const fs = require("firebase-admin");
const crypto = require("crypto");
const moment = require("moment");
const Code = require("../models/code.model");
const mapdata = require("../newEntries/HopfenHelden-Locations/hh.json");
const BierothekChecked = require("../newEntries/BierothekChecked.json");
const NotCheckLink = require("../newEntries/NotCheckLink.json");
const BierothekNotFound = require("../newEntries/BierothekNotFound.json");
const MatchingPairs = require("../newEntries/MatchingPairs.json");
const { default: axios } = require("axios");
const IndividualPin = require("../models/individualPin.model");
const getCities = require("../utilities/getCities");
const cheerio = require("cheerio");
const bouncer = require("express-bouncer")(500, 1000000, 10);

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

/*  */
/*  */
/*  */
/* REFACTORED */
/*  */
/*  */
/*  */

router
    .route("/refactored")
    .get(bouncer.block, authAllPubs, async (req, res) => {
        try {
            const globalMessage = await GlobalMessageV3.findOne();
            const pubPhotos = await PubPhoto.find({
                validated: true,
            });
            // IndividualPins
            let collectIndividualPins = [];
            if (true) {
                const allIndividualPins = await IndividualPin.find();
                allIndividualPins.forEach((current) => {
                    let cu = {
                        ...current._doc,
                    };
                    cu.photos = pubPhotos
                        .filter((c) => c.pub_id === cu.lokal_id)
                        .map((c) => c.imgURL);
                    collectIndividualPins.push(cu);
                });
            }
            const allPlu = await Plu.find({ verified: true });
            const allPlus = [];
            allPlu.forEach((current) => {
                const cu = {
                    ...current._doc,
                };
                delete cu.user_id;
                allPlus.push(cu);
            });
            let allKneipen = await Kneipe.find();
            allKneipen = allKneipen.map((c) => c._doc);
            const pubsWithoutPhotosAndBundles = [...allPlus, ...allKneipen];
            const collectPubs = [];
            pubsWithoutPhotosAndBundles.forEach((current) => {
                let cu = {
                    ...current,
                };
                const getPubID = cu.lokal_id || cu._id.toString();
                cu.photos = pubPhotos
                    .filter((c) => c.pub_id === getPubID)
                    .map((c) => c.imgURL);
                collectPubs.push(cu);
            });
            const allHotspots = await Hotspot.find();
            let returnValue = {
                kneipen: [...collectPubs, ...allHotspots, ...collectIndividualPins],
                globalMessage,
            };
            bouncer.reset(req);
            return res.json(returnValue);
        } catch (err) {
            console.log("err :>> ", err);
            res.status(500).send({
                error: true,
                err,
            });
        }
    });

router
    .route("/refactored")
    .post(bouncer.block, authAllPubs, async (req, res) => {
        try {
            const {
                interactions,
                filterSearches,
                mails,
                newentries,
                bbInteractions,
                partnerInteractions,
                counterUsers,
            } = req.body;
            for (const interaction of interactions) {
                const newCounterEinzel = new CounterEinzel(interaction);
                await newCounterEinzel.save();
            }
            for (const filterSearch of filterSearches) {
                const newCounterFilter = new CounterFilter(filterSearch);
                await newCounterFilter.save();
            }
            for (const mail of mails) {
                const newMail = new Mail(mail);
                await newMail.save();
                await sendMail(
                    "Neuer Änderungsvorschlag",
                    `<div>
                        <h1>Ein neuer Änderungsvorschlag</h1>
                        <p>Name: ${sanitizeHTML(mail.name)}</p>
                        <p>Adresse: ${sanitizeHTML(mail.adress)}</p>
                        <p>Nachricht: ${sanitizeHTML(mail.nachricht)}</p>
                    <div>
                    ${mail.adress.includes("PubInIMG: ")
                        ? `<img src="${sanitizeHTML(
                            mail.adress.substring(
                                mail.adress.indexOf("PubInIMG: ") + 10,
                                mail.adress.length
                            )
                        )}" />`
                        : ""
                    }
                    ${mail.name.includes("PubIn Report")
                        ? `<a href="https://testing-pubackend.herokuapp.com/people/pubin/link?pubin_id=${sanitizeHTML(
                            mail.name.replace("PubIn Report: ", "")
                        )}&password=${process.env.PUBPHOTO_LINKPW
                        }">Löschen</a>`
                        : ""
                    }
                    `
                );
            }
            for (const newentrie of newentries) {
                const latitude = 1;
                const longitude = 1;
                const adress = "Adresse einfügen";
                const once_id = Math.random();
                const newNewEntrie = new NewEntrie({
                    ...newentrie,
                    adress,
                    latitude,
                    longitude,
                    once_id,
                });
                await newNewEntrie.save();
                await sendMail(
                    "Neue Location",
                    `<div>
                        <h1>Eine neue Location wurde hinzugefügt</h1>
                        <p>Name: ${sanitizeHTML(newentrie.name)}</p>
                        <p>City: ${sanitizeHTML(newentrie.city)}</p>
                        <p>Extra City: ${sanitizeHTML(newentrie.extracity)}</p>
                        <p>Extra Category: ${sanitizeHTML(
                        newentrie.extracategory
                    )}</p>
                        <p>Extra Filter: ${sanitizeHTML(
                        newentrie.extrafilter
                    )}</p>
                        <h2>Löschen</h2>
                        <a href="https://testing-pubackend.herokuapp.com/newentrie/link?once_id=${once_id}&password=${process.env.PUBPHOTO_LINKPW
                    }">Löschen</a>
                    <div>`
                );
            }
            for (const bbInteraction of bbInteractions) {
                const newCounterBBInteraction = new CounterBBInteraction(
                    bbInteraction
                );
                await newCounterBBInteraction.save();
            }
            for (const partnerInteraction of partnerInteractions) {
                const newCounterPartnerInteraction =
                    new CounterPartnerInteraction(partnerInteraction);
                await newCounterPartnerInteraction.save();
            }
            for (const counterUser of counterUsers) {
                const newCounterUser = new CounterUser(counterUser);
                await newCounterUser.save();
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

// Add Google Place_ID to Kneipe or Plus
router.route("/place_id").post(bouncer.block, authAllPubs, async (req, res) => {
    try {
        const { pub_id: ID, place_id } = req.body;
        if (ID.includes("-") && ID.substring(0, 3) !== "ip-") {
            await Plu.findOneAndUpdate({ lokal_id: ID }, { place_id });
        } else if (ID.substring(0, 3) === "ip-") {
            await IndividualPin.findOneAndUpdate(
                { lokal_id: ID },
                { place_id }
            );
        } else {
            await Kneipe.findOneAndUpdate({ _id: ID }, { place_id });
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

// Add GlobalMessage
router
    .route("/gmsg")
    .post(bouncer.block, authGlobalMessage, async (req, res) => {
        const { de, en } = req.body;

        const newMessage = new GlobalMessageV3({
            de,
            en,
        });

        newMessage
            .save()
            .then(() => res.json("message added!"))
            .catch((err) =>
                res.status(400).json({
                    msgD: "Senden der Nachricht nicht möglich, bitte versuche es später nochmal",
                    msgE: "It's not possible to send your message, please try later",
                })
            );
    });

// Send Push Notifications
router.route("/push").post(bouncer.block, authAllPubs, async (req, res) => {
    const { allIDs, deu, eng, url } = req.body;
    if (!allIDs || !allIDs?.length || !deu || !eng || !url)
        return res.status(500).send({
            error: true,
        });
    const result = await sendPushNotifications(allIDs, deu, eng, url);
    bouncer.reset(req);
    res.json(result);
});

/*  */
/*  */
/*  */
/* FIRESTORE */
/*  */
/*  */
/*  */

const serviceAccount = {
    type: "service_account",
    project_id: process.env.FB_PROJECT_ID,
    private_key_id: process.env.FB_PRIVATE_KEY_ID,
    private_key: process.env.FB_PRIVATE_KEY.replace(/\\n/gm, "\n"),
    client_email: process.env.FB_CLIENT_EMAIL,
    client_id: process.env.FB_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FB_CERT_URL,
    universe_domain: "googleapis.com",
};

fs.initializeApp({
    credential: fs.credential.cert(serviceAccount),
});
const db = fs.firestore();

router
    .route("/fa")
    .get(bouncer.block, authLocal, authAllPubs, async (req, res) => {
        try {
            const partners = await db.collection("partners").get();
            const partnersData = partners.docs.map((doc) => {
                return {
                    partnerID: doc.id,
                    ...doc.data(),
                };
            });
            return res.json(partnersData);
        } catch (err) {
            console.log("err :>> ", err);
            res.status(500).send({
                error: true,
                err,
            });
        }
    });
router
    .route("/addPartner")
    .post(bouncer.block, authLocal, authAllPubs, async (req, res) => {
        try {
            const newPartner = {
                ...req.body,
            };
            delete newPartner.partnerID;
            await db
                .collection("partners")
                .doc(req.body.partnerID)
                .set(newPartner);
            return res.json("Done");
        } catch (err) {
            console.log("err :>> ", err);
            res.status(500).send({
                error: true,
                err,
            });
        }
    });
router
    .route("/addPartnerItem")
    .post(bouncer.block, authLocal, authAllPubs, async (req, res) => {
        try {
            const types = [
                "bookable",
                "veranstaltung",
                "drink",
                "checkin",
                "incentive",
                "news",
            ];
            const createdAt = Date.now() / 1000;
            const _id = crypto.randomBytes(16).toString("hex");
            const needToDos = ["photo", "qr", "location"];
            const getPartner = await db
                .collection("partners")
                .doc(req.body.partnerID)
                .get();
            const currentItems = getPartner.data().items;
            await db
                .collection("partners")
                .doc(req.body.partnerID)
                .update({
                    items: [
                        ...currentItems,
                        {
                            _id,
                            ...req.body,
                            type: types[req.body.type],
                            createdAt,
                            needToDo: !!req.body.needToDo
                                ? needToDos[req.body.needToDo]
                                : null,
                            impressions: [],
                            friendsInterested: [],
                        },
                    ],
                });
            return res.json("Done");
        } catch (err) {
            console.log("err :>> ", err);
            res.status(500).send({
                error: true,
                err,
            });
        }
    });
// getPubBundle by ID
router.route("/bundle").get(bouncer.block, authBarBundle, async (req, res) => {
    try {
        const { id } = req.query;
        let bundle = await db.collection("publicPubBundles").doc(id).get();
        bundle = bundle.data();
        if (!bundle) {
            const getUsers = await db.collection("users").get();
            const users = getUsers.docs.map((doc) => {
                return {
                    partnerID: doc.id,
                    ...doc.data(),
                };
            });
            users.forEach((current) => {
                if (
                    !!current.bundles?.length &&
                    current.bundles?.some((c) => c.bb_id === id)
                ) {
                    bundle = current.bundles?.find((c) => c.bb_id === id);
                }
            });
        }
        bouncer.reset(req);
        return res.json(bundle);
    } catch (err) {
        console.log("err :>> ", err);
        res.status(500).send({
            error: true,
            err,
        });
    }
});

// Incentives Codes
router.route("/code").post(bouncer.block, authAllPubs, async (req, res) => {
    try {
        const { partnerID, checkInID } = req.body;
        const getPartner = await db
            .collection("partners")
            .doc(partnerID)
            .get();
        const findItem = getPartner.data().items.find((c) => c._id === checkInID)
        let findCode = await Code.findOne({
            partnerID,
            checkInID,
        });
        findCode = {
            ...findCode._doc,
            ...findItem
        }
        bouncer.reset(req);
        return res.json(findCode || "NoMoreCodes");
    } catch (err) {
        console.log("err :>> ", err);
        res.status(500).send({
            error: true,
            err,
        });
    }
});
router
    .route("/code/delete")
    .post(bouncer.block, authAllPubs, async (req, res) => {
        try {
            const { code } = req.body;
            await Code.findOneAndDelete({
                code,
            });
            bouncer.reset(req);
            return res.json("Done");
        } catch (err) {
            console.log("err :>> ", err);
            res.status(500).send({
                error: true,
                err,
            });
        }
    });

// Send Mail when a publicPubBbundle was changed

router.route("/pbb").post(bouncer.block, authAllPubs, async (req, res) => {
    try {
        const { imgURL, name, info, bb_id } = req.body;
        await sendMail(
            "Neue Location",
            `<div>
                    <h1>Ein Public PubBundle wurde erstellt o. geändert</h1>
                    <img src="${sanitizeHTML(imgURL)}" />
                    <p>Name: ${sanitizeHTML(name)}</p>
                    <p>City: ${sanitizeHTML(info)}</p>
                    <h2>Löschen</h2>
                    <a href="https://testing-pubackend.herokuapp.com/complete/pbb?bb_id=${bb_id}&password=${process.env.PUBPHOTO_LINKPW
            }">Löschen</a>
                <div>`
        );
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
router.route("/pbb").get(bouncer.block, async (req, res) => {
    const { password, bb_id } = req.query;
    if (password !== process.env.PUBPHOTO_LINKPW || !bb_id)
        return res.status(403).json("Unauthorized");
    try {
        await db.collection("publicPubBundles").doc(bb_id).delete();
        res.json("Erfolgreich gelöscht");
    } catch {
        res.json("Fehler beim LÖschen");
    }
});

/*  */
/*  */
/*  */
/* HOPFENHELDEN && BIEROTHEK */
/*  */
/*  */
/*  */
router.route("/hh-test").get(bouncer.block, async (req, res) => {
    return res.json('Already Done')
    await IndividualPin.deleteMany({});
    let allExtras = []
    const allHHs = [...mapdata.bar, ...mapdata.brewery];
    for (let index = 0; index < allHHs.length; index++) {
        const pin = allHHs[index];
        const cities = getCities(pin.meta.city);
        const newIndividualPin = {
            lokal_id: `ip-${pin.ID}`,
            name: pin.post_title || pin.meta.name,
            description: pin.post_excerpt || pin.meta.desc,
            adress: `${pin.meta.street}, ${pin.meta.zip} ${pin.meta.city}`,
            latitude: `${pin.meta.geo.split("/").filter((c) => !!c)[0]}`,
            longitude: `${pin.meta.geo.split("/").filter((c) => !!c)[1]}`,
            category:
                pin.post_type === "hbm_bar"
                    ? "hh-bar"
                    : pin.post_type === "hbm_brewery"
                        ? "hh-brewery"
                        : "hh-shop",
            ...cities,
            place_id: pin.place_id,
            breweries: ['hopfenhelden']
        };
        // Opening Hours from HopfenHelden
        if (!!pin.meta.hours) {
            newIndividualPin.hours = pin.meta.hours;
        }
        // Link to HopfenHelden Seite
        if (!!pin.hhlink) {
            newIndividualPin.hhlink = pin.hhlink;
        }
        if (!pin.hhlink && !!pin.meta.link) {
            newIndividualPin.hhlink = pin.meta.link;
        }
        // Extra Infos from HopfenHelden
        if (!!pin.meta.type && Array.isArray(pin.meta.type)) {
            newIndividualPin.extra = pin.meta.type;
        } else if (!!pin.meta.type) {
            newIndividualPin.extra = pin.meta.type
                ?.trim()
                .split("_")
                .filter((c) => !!c);
        }

        if (!!pin.meta.type) {
            allExtras = [
                ...allExtras,
                ...newIndividualPin.extra
            ]
        }

        // Bierothek Link
        if (!!pin.bierothek_link) {
            newIndividualPin.bierothek_link = pin.bierothek_link
        }
        if (!!pin.instagram) {
            newIndividualPin.instagram = pin.instagram
        }
        if (!!pin.website) {
            newIndividualPin.website = pin.website
        }
        newIndividualPin.craft = pin.filters?.indexOf('craft') > -1
        newIndividualPin.smoking = pin.filters?.indexOf('not') > -1 ? "not" : pin.filters?.indexOf('yes') > -1 ? 'yes' : 'separate'
        newIndividualPin.outdoor = pin.filters?.indexOf('outdoor') > -1
        newIndividualPin.darts = pin.filters?.indexOf('darts') > -1
        newIndividualPin.billards = pin.filters?.indexOf('billards') > -1
        newIndividualPin.kicker = pin.filters?.indexOf('kicker') > -1
        newIndividualPin.streaming = pin.filters?.indexOf('streaming') > -1
        newIndividualPin.kitchen = pin.filters?.indexOf('nofood') > -1 ? "nofood" : pin.filters?.indexOf('warmfood') > -1 ? 'warmfood' : 'smallfood'
        newIndividualPin.cocktails = pin.filters?.indexOf('cocktails') > -1
        newIndividualPin.wine = pin.filters?.indexOf('wine') > -1
        newIndividualPin.music = pin.filters?.indexOf('music') > -1

        if (!pin.place_id) {
            const resp = await axios.get(
                `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=place_id&input=${newIndividualPin.adress}&inputtype=textquery&key=${process.env.GOOGLE_API}`
            );
            const { data } = resp;
            if (!!data && !!data.candidates && !!data.candidates?.length) {
                if (!!data.candidates[0].place_id) {
                    newIndividualPin.place_id = data.candidates[0].place_id;
                }
            }
        }
        const newIndividualPinSchema = new IndividualPin(newIndividualPin);
        await newIndividualPinSchema.save();
    }
    console.log("All Extra Informations from HopfenHelden", new Set(allExtras))
    res.json("Done");
});
const changeEintrag = async (pub_id, newBrewery) => {
    const makeChange = true
    if (pub_id.substring(0, 3) === 'ip-') {
        const findPub = await IndividualPin.findOne({ lokal_id: pub_id });
        if (makeChange && findPub.category !== 'bierothek') {
            console.log("change ip", pub_id)
            await IndividualPin.findOneAndUpdate({ lokal_id: pub_id }, {
                breweries: [
                    'bierothek',
                    ...findPub.breweries
                ],
                description: newBrewery.description || findPub.description || '',
                bierothek_link: newBrewery.bierothek_link,
                instagram: newBrewery.instagram || findPub.instagram || '',
                website: newBrewery.website || findPub.website || '',
                craft: true,
                img: newBrewery.img,
                category: 'bierothek'
            })
        }
    } else if (pub_id.includes('-')) {
        const findPub = await Plu.findOne({ lokal_id: pub_id });
        if (makeChange && findPub.category !== 'bierothek') {
            console.log("change plus", pub_id)
            await Plu.findOneAndUpdate({ lokal_id: pub_id }, {
                breweries: [
                    'bierothek',
                    ...findPub.breweries
                ],
                description: newBrewery.description || findPub.description || '',
                bierothek_link: newBrewery.bierothek_link,
                instagram: newBrewery.instagram || findPub.instagram || '',
                website: newBrewery.website || findPub.website || '',
                craft: true,
                img: newBrewery.img,
                category: 'bierothek'
            })
        }
    } else {
        let findPub = await Kneipe.findOne({ _id: pub_id });
        const dont = ['638b458b857caa0004c1ebda']
        if (makeChange && dont.indexOf(pub_id) === -1 && findPub.category !== 'bierothek') {
            console.log("change kneipe", pub_id)
            await Kneipe.findOneAndUpdate({ _id: pub_id }, {
                breweries: [
                    'bierothek',
                    ...findPub.breweries
                ],
                description: newBrewery.description || findPub.description || '',
                bierothek_link: newBrewery.bierothek_link,
                instagram: newBrewery.instagram || findPub.instagram || '',
                website: newBrewery.website || findPub.website || '',
                craft: true,
                img: newBrewery.img,
                category: 'bierothek'
            })
        }
    }
    return 'Done'
}
router.route("/bierothek").get(bouncer.block, async (req, res) => {
    try {
        await IndividualPin.deleteMany({ bierothek: true })
        if (true) return res.json('Not in Production')
        // Prepare Name Check
        let allPubs = await Kneipe.find();
        const allPlus = await Plu.find();
        const allIPs = await IndividualPin.find();
        allPubs = [...allPubs, ...allPlus, ...allIPs];
        // Collect Breweries
        let savedCounter = 0
        let changedCounter = 0
        const resp = await axios.get('https://bierothek.de/brauereien')
        const { data: html } = resp
        const $ = cheerio.load(html);
        const parentElements = $('.product-wrapper .row > div')
        // Run Loop
        for (let i = 0; i < parentElements.length; i++) {
            console.log('Run', i, parentElements.length);
            const element = parentElements[i];
            const bierothek_link = `https://bierothek.de${$(element).find('a').attr('href')}`
            if (NotCheckLink.indexOf(bierothek_link) === -1) {
                let singleResp
                await axios.get(bierothek_link, {
                    timeout: 5000
                }).then((data) => {
                    singleResp = data.data
                }).catch(async () => {
                    const secondTry = await axios.get(bierothek_link, {
                        timeout: 5000
                    })
                    console.log('finally secondTry :>> data?', bierothek_link, !!secondTry?.data);
                    if (!!secondTry?.data) {
                        singleResp = secondTry.data
                    } else {
                        const thirdTry = await axios.get(bierothek_link, {
                            timeout: 5000
                        })
                        console.log('finally thirdTry :>> data?', bierothek_link, !!thirdTry?.data);
                        if (!!thirdTry?.data) {
                            singleResp = thirdTry.data
                        } else {
                            const findBrewery = BierothekNotFound.find((c) => c.bierothek_link === bierothek_link)
                            if (!findBrewery) return
                            const findMatchingPubIDs = MatchingPairs.filter((c) => c.name === findBrewery.name)
                            if (!!findMatchingPubIDs?.length) {
                                changedCounter += 1
                                for (let indexChange = 0; indexChange < findMatchingPubIDs.length; indexChange++) {
                                    changeEintrag(findMatchingPubIDs[indexChange].pub_id, findBrewery)
                                }
                            } else {
                                const newIndividualPin = new IndividualPin({
                                    lokal_id: `ip-${crypto.randomUUID()}`,
                                    ...findBrewery
                                })
                                newIndividualPin.save()
                                savedCounter += 1
                            }
                        }
                    }
                })
                if (!!singleResp) {
                    const content = cheerio.load(singleResp);
                    const name = $(element).find('.brewerie-name').html()
                    const addressElement = content('.bt-mpb').find('.store-info:first-of-type').html().toString()
                    let findAddress = addressElement.substring(addressElement.indexOf('</strong>') + 9, addressElement.length)
                    findAddress = replaceAll(findAddress, '<br>', '')
                    let newBrewery = {
                        name,
                        bierothek_link,
                        img: $(element).find('img').attr('src'),
                        website: content('.bt-mpb').find('.store-info:last-of-type').find('a').attr('href'),
                        category: 'bierothek',
                        lokal_id: `ip-${crypto.randomUUID()}`,
                        breweries: ['bierothek'],
                        craft: true,
                        smoking: 'not',
                        outdoor: false,
                        darts: false,
                        billards: false,
                        kicker: false,
                        streaming: false,
                        kitchen: "nofood",
                        cocktails: false,
                        wine: false,
                        music: false,
                        bierothek: true
                    }
                    let description = ''
                    content('.site-content .row > div:first-of-type p, .site-content .row > div:first-of-type h3').each((indexEach, ele) => {
                        const childEle = content(ele).html().toString()
                        if (!!childEle.trim()) {
                            description += `${replaceAll(childEle, '&nbsp;', '')}\n\n`
                        }
                    })
                    if (!!description) {
                        newBrewery.description = removeHTMLTags(description)
                    }
                    const respCoordinates = await axios.get(
                        `https://maps.googleapis.com/maps/api/geocode/json?address=${findAddress}&key=${process.env.GOOGLE_API}`
                    );
                    if (!!respCoordinates?.data?.results?.length) {
                        const { results } = respCoordinates.data
                        results?.forEach((result) => {
                            if (!!result.geometry.location.lat) {
                                newBrewery.latitude = result.geometry.location.lat
                            }
                            if (!!result.geometry.location.lng) {
                                newBrewery.longitude = result.geometry.location.lng
                            }
                            newBrewery.adress = result.formatted_address
                            result.address_components?.forEach((ac) => {
                                if (ac?.types?.indexOf('political') > -1 && ac?.types?.indexOf('locality') > -1) {
                                    newBrewery.city = ac.long_name
                                }
                                if (!newBrewery.city && ac?.types?.indexOf('postal_town') > -1) {
                                    newBrewery.city = ac.long_name
                                }
                                if (!newBrewery.city && ac?.types?.indexOf('administrative_area_level_1') > -1) {
                                    newBrewery.city = ac.long_name
                                }
                                if (!newBrewery.city && ac?.types?.indexOf('country') > -1) {
                                    newBrewery.city = ac.long_name
                                }
                            })
                            if (!newBrewery.city || !newBrewery.latitude || !newBrewery.longitude || !newBrewery.adress) {
                                console.log('Missing Infos', name, result.address_components);
                            }
                        })
                        if (!!newBrewery.city) {
                            const cities = getCities(newBrewery.city);
                            if (!!cities) {
                                newBrewery = {
                                    ...newBrewery,
                                    ...cities
                                }
                            }
                        } else {
                            console.log('city === none');
                            newBrewery = {
                                ...newBrewery,
                                city: 'World',
                                city2: 'none'
                            }
                        }
                    } else {
                        console.log('no googleapis results', name);
                        newBrewery.latitude = 1
                        newBrewery.longitude = 1
                        newBrewery.adress = findAddress
                        newBrewery.city = 'addCity'
                        newBrewery.city2 = 'addCity2'
                    }
                    const nameCheck = checkNames(name, allPubs)
                    if (!!nameCheck.length && BierothekChecked.indexOf(name) === -1) {
                        const findMatchingPubIDs = MatchingPairs.filter((c) => c.name === name)
                        // console.log("possible double :>>", name, "|", newBrewery.adress, "|", nameCheck, "|", findMatchingPubIDs)
                        changedCounter += 1
                        if (nameCheck.length === 1) {
                            await changeEintrag(nameCheck[0].pub_id, newBrewery)
                        } else if (!!findMatchingPubIDs?.length) {
                            for (let indexChange = 0; indexChange < findMatchingPubIDs.length; indexChange++) {
                                await changeEintrag(findMatchingPubIDs[indexChange].pub_id, newBrewery)
                            }
                        } else {
                            console.log("nameCheck but add anyway", name)
                            if (!!newBrewery.city && !!newBrewery.latitude && !!newBrewery.longitude && !!newBrewery.adress) {
                                const newIndividualPin = new IndividualPin(newBrewery)
                                await newIndividualPin.save()
                                savedCounter += 1
                            }
                        }
                    } else {
                        if (!!newBrewery.city && !!newBrewery.latitude && !!newBrewery.longitude && !!newBrewery.adress) {
                            const newIndividualPin = new IndividualPin(newBrewery)
                            await newIndividualPin.save()
                            savedCounter += 1
                        }
                    }
                } else {
                    console.log('noURLData', bierothek_link);
                }
            }
        }
        console.log('savedCounter :>> ', savedCounter);
        console.log('changedCounter :>> ', changedCounter);
        res.json('Done');
    } catch (err) {
        res.json(`Error :>> ${err}`)
    }
});
router.route("/check-doubles").get(bouncer.block, async (req, res) => {

    res.json('Done')
})

/*  */
/*  */
/*  */
/* ANALYTICS */
/*  */
/*  */
/*  */
router.route("/a").get(bouncer.block, async (req, res) => {
    try {
        function sortAfterNum(a, b) {
            if (a.num > b.num) {
                return -1;
            }
            if (a.num < b.num) {
                return 1;
            }
            return 0;
        }
        let value = "";
        const appendText = (h, text, tabs = 1) => {
            value += `<h${h} style="font-family: monospace">${text}</h${h}>`;
            for (let index = 0; index < tabs; index++) {
                value += "<br>";
            }
        };
        appendText(1, "PubUp Analytics");

        const allInteractions = await CounterEinzel.find();
        const allBBInteractions = await CounterBBInteraction.find();
        const allFilters = await CounterFilter.find();
        const allCounterUserAndroid = await CounterUser.find({
            os_version: "android",
            action: "AppOpen",
        });
        const allCounterUserIOS = await CounterUser.find({
            os_version: "ios",
            action: "AppOpen",
        });
        const allCounterUserLogins = await CounterUser.find({
            action: "Login",
        });
        const allCounterUserLogouts = await CounterUser.find({
            action: "Logout",
        });
        const allCounterUserAccountCreation = await CounterUser.find({
            action: "AccountCreation",
        });
        const allCounterUserAccountDeletion = await CounterUser.find({
            action: "deleteAccount",
        });
        const allCounterUserResetApp = await CounterUser.find({
            action: "resetApp",
        });
        const allClicksFromWebsite = await CounterInteraction.find();
        // Overall Interactions for Locations
        appendText(2, `${allInteractions.length} Location Interaktionen`);
        appendText(2, `${allBBInteractions.length} PubBundle Interaktionen`);
        appendText(2, `${allFilters.length} Filter Suchen`);
        appendText(2, `${allCounterUserIOS.length} App Inits on iOS`);
        appendText(2, `${allCounterUserAndroid.length} App Inits on Android`);
        appendText(2, `${allCounterUserLogins.length} User Logins`);
        appendText(2, `${allCounterUserLogouts.length} User Logouts`);
        appendText(
            2,
            `${allCounterUserAccountCreation.length} Account Creations`
        );
        appendText(
            2,
            `${allCounterUserAccountDeletion.length} Account Deletions`
        );
        appendText(2, `${allCounterUserResetApp.length} App Resets`);
        appendText(2, `${allClicksFromWebsite.filter((c) => c.locale.includes('AppStore')).length} App Store Clicks from Website`);
        appendText(2, `${allClicksFromWebsite.filter((c) => c.locale.includes('Google')).length} Google Play Store Clicks from Website`);
        appendText(2, "-------------", 2);


        // Buddies / Partners
        appendText(2, "Buddies");

        const allPartnerInteractions = await CounterPartnerInteraction.find()
        const allPartnerIDs = allPartnerInteractions.map((c) => c.partner_id)
        const everyPartnerID = new Set(allPartnerIDs)
        const collectAllPartners = []

        everyPartnerID.forEach((cpi) => {
            collectAllPartners.push({
                partner_id: cpi,
                num: allPartnerInteractions.filter((c) => c.partner_id === cpi).length
            })
        })

        collectAllPartners.sort(sortAfterNum).forEach((c) => {
            appendText(2, `${c.partner_id} :>> ${c.num}`);
        })

        appendText(2, "-------------", 2);

        // Last 14 Days
        // Interactions & Filters
        appendText(2, "Letzten 14 Tage");
        const startdate = moment().subtract(14, "days").toDate();
        const now = new Date();

        for (const d = startdate; d < now; d.setDate(d.getDate() + 1)) {
            let counter = 0;
            const dm = moment(d, "MM/D/YYYY");
            allInteractions.forEach((current) => {
                const createdAt = moment(current.createdAt, "MM/D/YYYY");
                if (createdAt.isSame(dm, "date")) {
                    counter += 1;
                }
            });
            appendText(5, dm, 0);
            appendText(3, `${counter} Interaktionen`, 0);
            counter = 0;
            allFilters.forEach((current) => {
                const createdAt = moment(current.createdAt, "MM/D/YYYY");
                if (createdAt.isSame(dm, "date")) {
                    counter += 1;
                }
            });
            appendText(3, `${counter} Filter Suchen`);
        }
        appendText(2, "-------------", 2);

        // Most Interacted Locations
        const allPubs = await Kneipe.find();
        const allPlus = await Plu.find();
        const allLocations = [...allPlus, ...allPubs];
        const collectIDs = [];
        allInteractions.forEach((current) => {
            collectIDs.push(current.lokal_id);
        });
        const occurrences = collectIDs.reduce(function (acc, curr) {
            return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
        }, {});
        let collectCounterLocations = [];
        allLocations.forEach((current) => {
            const getID = current.lokal_id || current._id;
            const getNum = occurrences[getID];
            if (!!getNum /* && current.city === "Berlin" && getNum >= 10 */) {
                collectCounterLocations.push({
                    num: getNum,
                    name: current.name,
                    city:
                        current.city !== "World"
                            ? current.city
                            : current.city2 || current.extracity,
                });
            }
        });
        collectCounterLocations = collectCounterLocations.sort(sortAfterNum);

        for (let i = 0; i < collectCounterLocations.length; i++) {
            const element = collectCounterLocations[i];
            appendText(4, `${element.name}`, 0);
            appendText(4, `${element.num} Interaktionen`);
        }
        appendText(2, "-------------", 2);

        // Most Interacted PubBundles
        const allPubBundles = await BarBundle.find();
        const collectBBIDs = [];
        allBBInteractions.forEach((current) => {
            collectBBIDs.push(current.bb_id);
        });
        const occurrencesBB = collectBBIDs.reduce(function (acc, curr) {
            return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
        }, {});
        let collectCounterBB = [];
        allPubBundles.forEach((current) => {
            const getNum = occurrencesBB[current.bb_id];
            if (!!getNum && current.public) {
                collectCounterBB.push({
                    num: getNum,
                    name: current.name,
                });
            }
        });
        collectCounterBB = collectCounterBB.sort(sortAfterNum);

        for (let ibb = 0; ibb < collectCounterBB.length; ibb++) {
            const elementBB = collectCounterBB[ibb];
            appendText(4, `${elementBB.name}`, 0);
            appendText(4, `${elementBB.num} Interaktionen`);
        }

        return res.send(value);
    } catch (err) {
        console.log("err :>> ", err);
        res.status(500).send({
            error: true,
            err,
        });
    }
});

module.exports = router;
