const authLocal = (req, res, next) => {
    if (!process.env.NODE_ENV) return res.sendStatus(403);
    next();
};

module.exports = authLocal;
