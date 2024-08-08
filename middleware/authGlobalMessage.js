const authGlobalMessage = (req, res, next) => {
    try {
        const token = req.header("globalMessage-token");

        if (!token) {
            res.status(401).json({
                msg: "No authentication, authorization denied!",
            });
        }

        if (token !== process.env.GLOBALMESSAGE_PW) {
            res.status(401).json({
                msg: "Token verification failed, authorization denied!",
            });
        }

        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = authGlobalMessage;
