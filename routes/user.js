const router = require("express").Router();
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const crypto = require("crypto");

const bouncer = require("express-bouncer")(500, 1000000, 10);

// bouncer.block,

bouncer.whitelist.push("217.160.0.141");
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

// SIGNUP
router.post("/signup", bouncer.block, async (req, res) => {
    try {
        const { username, password, lokalName, selectEnglish } = req.body;

        if (!username || !password || !lokalName) {
            return res.status(400).json({
                msg: "Nicht alle Felder sind ausgefüllt / Not all fields have been entered",
            });
        }

        const checkUsername = await User.find({ username: username });
        if (checkUsername.length > 0) {
            return res.json({
                error: true,
                msg: "Username existiert bereits / Username already exists",
            });
        }

        // Hash the Password
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const new_user_id = crypto.randomBytes(20).toString("hex");

        // LOKAL ID
        function getRandomArbitrary(min, max) {
            return Math.random() * (max - min) + min;
        }
        let new_lokal_id = crypto.randomBytes(20).toString("hex");

        const firstIndex = getRandomArbitrary(1, new_lokal_id.length / 2);

        const secondIndex = getRandomArbitrary(
            new_lokal_id.length / 2,
            new_lokal_id.length - 1
        );

        new_lokal_id = `${new_lokal_id.slice(
            0,
            firstIndex
        )}-${new_lokal_id.slice(firstIndex, secondIndex)}-${new_lokal_id.slice(
            secondIndex,
            new_lokal_id.length
        )}`;

        const newUser = new User({
            user_id: new_user_id,
            username,
            lokalname: lokalName,
            lokal_id: new_lokal_id,
            password: passwordHash,
            english: selectEnglish,
            entry_created: false,
            entry_verified: false,
        });

        const token = jwt.sign({ id: new_user_id }, process.env.JWT_PW);

        newUser
            .save()
            .then(() => {
                bouncer.reset(req);
                res.json({
                    success: true,
                    token,
                    user: {
                        user_id: new_user_id,
                        username,
                        lokalname: lokalName,
                        lokal_id: new_lokal_id,
                        english: selectEnglish,
                        entry_created: false,
                    },
                });
            })
            .catch((err) => res.status(400).json("Error: " + err));
    } catch (err) {
        res.status(500).json({
            msgD: "Opps, da ist was schief gegangen, bitte versuche es nochmal",
            msgE: "Opps, something went wrong, please try again",
        });
    }
});
/* router.post("/changePW", bouncer.block, async (req, res) => {
    try {
        const { user_id, PW } = req.body;

        // Hash the Password
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(PW, salt);

        console.log("passwordHash :>> ", passwordHash);

        const currentUser = await User.findOne({ user_id });

        console.log({
            ...currentUser._doc,
            password: passwordHash,
        });
        await User.findOneAndUpdate(
            { user_id },
            {
                ...currentUser._doc,
                password: passwordHash,
            }
        );

        res.json("Done");
    } catch (err) {
        res.status(500).json({
            msgD: "Opps, da ist was schief gegangen, bitte versuche es nochmal",
            msgE: "Opps, something went wrong, please try again",
        });
    }
}); */

// TOKEN VALIDATION
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
        const user = await User.find({ user_id: verified.id });
        if (!user.length) {
            return res.json(false);
        }
        bouncer.reset(req);
        return res.json(true);
    } catch (err) {
        console.log("err :>> ", err);
        res.status(500).json({
            msgD: "Opps, da ist was schief gegangen, bitte versuche es nochmal",
            msgE: "Opps, something went wrong, please try again",
        });
    }
});

// LOGIN
router.route("/login").post(bouncer.block, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            msgD: "Nicht alle Felder ausgefüllt",
            msgE: "Not all fields have been entered",
        });
    }

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({
            msgD: "Es wurde kein Account unter diesem Username gefunden",
            msgE: "No Account with this username has been registered",
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({
            msgD: "Ungültige Login Daten",
            msgE: "Invalid Login Data",
        });
    }

    const token = jwt.sign({ id: user.user_id }, process.env.JWT_PW);
    bouncer.reset(req);
    return res.json({
        token,
        user,
    });
});

router.get("/", bouncer.block, auth, async (req, res) => {
    const user = await User.findOne({ user_id: req.user });

    if (!user)
        return res.status(400).json({
            msgD: "Es wurde kein Account unter dieser Mail gefunden",
            msgE: "No Account with this email has been registered",
        });
    const returnUser = {
        ...user._doc,
    };
    delete returnUser.password;
    bouncer.reset(req);
    res.json(returnUser);
});

router.delete("/delete", bouncer.block, auth, async (req, res) => {
    try {
        const deletedUser = await User.findOneAndDelete({ user_id: req.user });
        res.json(deletedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
