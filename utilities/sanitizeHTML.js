const xss = require("xss");

const sanitizeHTML = (obj) => {
    return xss(obj);
};

module.exports = sanitizeHTML;
