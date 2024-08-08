const authAddUser = (req, res, next) => {
    try {
        const token = req.header("addUser-token")

        if (!token) {
            res.status(401).json({ msg: "No authentication, authorization denied!" })
        }

        if (token !== process.env.addUser_PW) {
            res.status(401).json({ msg: "Token verification failed, authorization denied!" })
        }

        next()

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = authAddUser