const authAddPlu = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (typeof authHeader !== "undefined") {
        const bearer = authHeader.split(" ");
        const bearerToken = bearer[1];
        if (!bearerToken) {
            res.sendStatus(403);
        }
        if (bearerToken === process.env.ADDPLU_PW) {
            next();
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(403);
    }
};

module.exports = authAddPlu;
