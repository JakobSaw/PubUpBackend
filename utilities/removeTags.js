function removeHTMLTags(htmlString) {
    return htmlString.replace(/<\/?[^>]+(>|$)/g, "");
}

module.exports = removeHTMLTags