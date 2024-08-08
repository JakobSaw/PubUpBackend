const replaceUmlauts = require("./replaceUmlaute");

const getCities = (city) => {
    let returnValue;

    const rightCity = true ? city.toLowerCase() : replaceUmlauts(city).toLowerCase();

    if (rightCity.includes("berlin")) {
        returnValue = {
            city: "Berlin",
        };
    } else if (rightCity.includes("hamburg")) {
        returnValue = {
            city: "Hamburg",
        };
    } else if (rightCity.includes("münchen")) {
        returnValue = {
            city: "München",
        };
    } else if (rightCity.includes("köln")) {
        returnValue = {
            city: "Köln",
        };
    } else if (rightCity.includes("frankfurt am main")) {
        returnValue = {
            city: "Frankfurt am Main",
        };
    } else if (rightCity.includes("leipzig")) {
        returnValue = {
            city: "Leipzig",
        };
    } else if (rightCity.includes("heidelberg")) {
        returnValue = {
            city: "Heidelberg",
        };
    } else if (rightCity.includes("münster")) {
        returnValue = {
            city: "Münster",
        };
    } else if (rightCity.includes("dortmund")) {
        returnValue = {
            city: "Dortmund",
        };
    } else if (rightCity.includes("bonn")) {
        returnValue = {
            city: "Bonn",
        };
    } else {
        returnValue = {
            city: "World",
            city2: city,
        };
    }
    return returnValue;
};

module.exports = getCities;
