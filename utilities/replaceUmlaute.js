function replaceUmlauts(text) {
    const umlautReplacements = {
        ä: "a",
        ö: "o",
        ü: "u",
        Ä: "A",
        Ö: "O",
        Ü: "U",
        ß: "ss",
    };

    return text.replace(/[äöüÄÖÜß]/g, (match) => umlautReplacements[match]);
}
module.exports = replaceUmlauts;
