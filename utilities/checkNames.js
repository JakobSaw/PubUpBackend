function checkNamesOLD(str1, str2) {
    // Convert both strings to lowercase
    const lowerStr1 = str1.toLowerCase();
    const lowerStr2 = str2.toLowerCase();

    // Check for complete match
    const completeMatch = lowerStr1 === lowerStr2;

    // Split strings into words
    const wordsStr1 = lowerStr1.split(/\s+/);
    const wordsStr2 = lowerStr2.split(/\s+/);

    // Check for any word matches
    const anyWordMatch = wordsStr1.some(word => wordsStr2.includes(word));

    return {
        completeMatch: completeMatch,
        anyWordMatch: anyWordMatch
    };
}
function checkNames(inputString, nameObjects) {
    // Convert the input string to lowercase
    const lowerInputString = inputString.toLowerCase();

    // Split the input string into words
    const inputWords = lowerInputString.split(/\s+/);

    // Filter the nameObjects array to find matches
    const matchingNames = []
    nameObjects.forEach(obj => {
        const lowerName = obj.name.toLowerCase();
        const nameWords = lowerName.split(/\s+/);
        const completeMatch = lowerInputString === lowerName;
        const anyWordMatch = inputWords.some(word => nameWords.includes(word));
        if (completeMatch || anyWordMatch) {
            matchingNames.push(
                {
                    name: obj.name,
                    pub_id: obj.lokal_id || obj.id,
                    adress: obj.adress
                }
            )
        }
    })
    return matchingNames;
}
module.exports = checkNames;