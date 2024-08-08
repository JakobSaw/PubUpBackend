const authBarBundle = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (typeof authHeader !== "undefined") {
        const bearer = authHeader.split(" ");
        const bearerToken = bearer[1];
        if (!bearerToken) {
            return res.sendStatus(403);
        }
        if (bearerToken === process.env.BARBUNDLE_PW) {
            next();
        } else {
            return res.sendStatus(403);
        }
    } else {
        res.sendStatus(403);
    }
};

module.exports = authBarBundle;
