const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const toobusy = require("toobusy-js");
const hpp = require("hpp");
const helmet = require("helmet");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 6000;

// Cors Middleware => JSON PARSE
app.use(cors());

// Limit Request Size
app.use(express.json({ limit: "50mb" }));

// middleware which blocks requests when we're too busy
app.use(function (req, res, next) {
    if (toobusy()) {
        res.status(503).send("Server is too busy.");
    } else {
        next();
    }
});

app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});
app.use(express.urlencoded({ extended: false }));

app.use(hpp());
app.use(helmet());

const uri = process.env.ATLAS_URI;

//
mongoose.connect(uri, {
    minPoolSize: 1,
    maxPoolSize: 20,
    compression: { compressors: ["zlib"] },
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    socketTimeoutMS: 60000,
    serverSelectionTimeoutMS: 60000,
    connectTimeoutMS: 60000,
    loggerLevel: "error",
});

mongoose.connection.on("connecting", () => console.log("database connecting"));
mongoose.connection.on("connected", () => console.log("database connected"));
mongoose.connection.on("disconnecting", () =>
    console.log("database disconnecting")
);
mongoose.connection.on("disconnected", () =>
    console.log("database disconnected")
);
mongoose.connection.on("error", () => console.log("database error"));

// NEW ENTRIES
const newEntrieRouter = require("./routes/newentrie");
app.use("/newentrie", newEntrieRouter);

// KNEIPEN
const kneipeRouter = require("./routes/kneipe");
app.use("/kneipe", kneipeRouter);

// PLUS EINTRÄGE
const pluRouter = require("./routes/plu");
app.use("/plu", pluRouter);

const messageRouter = require("./routes/message");
app.use("/message", messageRouter);

// COUNTERS
const counterEinzelRouter = require("./routes/counterEinzel");
app.use("/counterEinzel", counterEinzelRouter);
const counterPortalRouter = require("./routes/counterPortal");
app.use("/counterPortal", counterPortalRouter);
const counterInteractionRouter = require("./routes/counterInteraction");
app.use("/counterInteraction", counterInteractionRouter);

// USERS
const userRouter = require("./routes/user");
app.use("/user", userRouter);

// COMPLETE
const completeRouter = require("./routes/complete");
app.use("/complete", completeRouter);

// BarBundles
const barBundleRouter = require("./routes/barBundle");
app.use("/barBundle", barBundleRouter);

// PubPhotos
const pubPhotoRouter = require("./routes/pubPhoto");
app.use("/pubPhoto", pubPhotoRouter);

// INCENTIVE
const incentiveRouter = require("./routes/incentive");
app.use("/incentive", incentiveRouter);

// ADMIN
const adminRouter = require("./routes/admin");
app.use("/admin", adminRouter);

// VERANSTALTUNGEN
const veranstaltungRouter = require("./routes/veranstaltung");
app.use("/veranstaltung", veranstaltungRouter);

// serve static assets if in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(__dirname));
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

app.on("uncaughtException", function (err) {
    // clean up allocated resources
    // log necessary error details to log files
    console.log("uncaughtException", err);
    process.exit(); // exit the process to avoid unknown state
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
