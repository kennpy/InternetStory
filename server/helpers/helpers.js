const fs = require('fs');
const csvParser = require("csv-parser");
const xss = require('xss');
const v = require('validator');
const { resolve } = require('path');

const CSV_FILE_PATH = "/Users/kenjismith/Programming/personal/internet-story/server/helpers/Terms-to-Block.csv";
const NAUGHTY_LIST_FILE_PATH = "/Users/kenjismith/Programming/personal/internet-story/server/helpers/naughtyList2.json";


// GENERAL HELPER SECTION

/**
 * Generate and returns random bool
 * @returns random boolean
 */
const getRandBool = () => {
    const randBool = (Math.random() > .5) ? true : false
    console.log("new bool ; ", randBool);
    return randBool;
}

// WORD VALIDATION SECTION

/**
 * Verifies word is not racist, vulgar, or link
 * @param {string} word - a word to verify
 * @returns {boolean} - whether the word is allowed or not
 */
const wordIsValid = async (word) => {

    let isBadWord = await wordIsBad(word).catch((err) => {
        console.log("error that was catched : ", err);
    }); // await make it undefined -- originally it is a promise that is pending (idk what is going on)
    let wordIsRegex = cleanedRegex(word);
    let wordIsWeird = userDidWeirdStuff(word);

    word = preventXSS(word);

    console.log("word is bad : ", isBadWord);
    console.log("word is regex : ", wordIsRegex);
    console.log("word is weird : ", wordIsWeird);
    console.log("word after preventXSS : ", word);


    // check if word is a url

    if (wordIsRegex) return false;
    if (isBadWord) return false;
    if (wordIsWeird) return false;

    return true;
}
// HELPERS THAT HELP

/**
 * Checks if word is a url
 * @param {string} word
 * @returns {bool} isUrl
 */
const userDidWeirdStuff = async function (word) {
    // removed : v.isIdentityCard , 
    let listOfCheckers = [v.isBtcAddress, v.isCurrency, v.isEAN, v.isEmail, v.isFQDN, v.isIBAN, v.isIP, v.isISBN, v.isIPRange, v.isMobilePhone, v.isEthereumAddress, v.isJWT, v.isJSON, v.isLatLong, v.isMACAddress, v.isMongoId, v.isPort, v.isUUID];

    listOfCheckers.forEach(validChecker => {
        if (validChecker(word)) {
            return false;
        }
    });
    return true;

}

/**
 * Checks if word is bad word (from list of bad words)
 */
async function wordIsBad(word) {
    try {
        // check if word in list of bad words

        //let badListOne = await convertCsvToList(CSV_FILE_PATH);
        //let badListTwo = await convertJsonToList(NAUGHTY_LIST_FILE_PATH);
        // let badLists = await Promise.all([convertCsvToList(CSV_FILE_PATH), convertJsonToList(NAUGHTY_LIST_FILE_PATH)]).then((data) => console.log("\n\nReturned bad lists\n\n : ", data));
        convertCsvToList(CSV_FILE_PATH).then((result) => {
            console.log("RESULT in bad: ", result);
            let wordConclusion = result.includes(word);
            resolve(wordConclusion);
        })

        // console.log("Bad lists before conversion : ", badLists);
        // badLists = badLists ?? [-1]; // if badlists is null we set it to an array storing -1 (helps debug)

        // if (badLists[0] != -1) {
        //     [badListOne, badListTwo] = badLists;

        //     console.log("bad list : ", badLists);
        //     console.log("L ONE : ", badListOne);
        //     console.log("L TWO L : ", badListTwo);


        //     if (badListOne.includes(word)) return false;
        //     if (badListTwo.includes(word)) return false;

        //     else {
        //         return true;
        //     }
        // }
    } catch (err) {
        console.log("ERROR WORD_is_bad : ", err.message);
    }

}

/**
 * Checks if word is a regex expressoin (these are bad since they can cause errors)
 */
function cleanedRegex(oldWord) {
    var scriptRegexTwo = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    let newWord = oldWord.replace(/[|&;$%@"<>()+,]/g, "");
    newWord = newWord.replace(scriptRegexTwo, "");

    return hadToClean = (oldWord == newWord) ? true : false;
}
/**
 * Checks everything im not thinking about
 */
function preventXSS(word) {
    word = xss.filterXSS(word);
    return word;
}

/**
 * Converts csv file of words to a list 
 * @param {string} csvFilePath - the file to read from
 * @return {Array} - list of words
 */
const convertCsvToList = async (csvFilePath) => {
    try {
        let wordListOut = [];
        GetList(csvFilePath).then((newlyMadeList) => {
            console.log('GetList returned ', newlyMadeList);
            Promise.resolve(newlyMadeList);
            // return new Promise((resolve) => {
            //     resolve(newlyMadeList);
            // });
        });
    } catch (e) {
        console.log("\n\nERROR CSV : ", e.message);
    }
}

/**
 * Obvious 
 * @returns list 
 */
const convertJsonToList = async (filePath) => {
    let newList = [];
    fs.readFile(filePath, (err, data) => {
        // for every json element add to list then return it
        try {
            data = JSON.parse(data);
            data.forEach(element => {
                newList.push(element);
            });
            //console.log("wordlist JSON : ", newList);
            return new Promise((resolve) => {
                resolve(newList);
            })
        }
        catch (err) {
            console.log("ERROR JSON : ", err.message);
        }
    })
}
// convertJsonToList(NAUGHTY_LIST_FILE_PATH);

module.exports = { wordIsValid };

async function GetList(csvFilePath) {
    try {
        fs.readFile(csvFilePath, (err, data) => {
            let counter = 0;

            let wordListIn = [];
            fs.createReadStream(csvFilePath)
                .pipe(csvParser())
                .on("data", (data) => {
                    // ignore the first entry (meta data we dont care about)
                    if (counter != 0) {
                        wordListIn.push(data['Your Gateway to the Chrisitan Audience']);
                    }
                    counter++;
                });
            console.log('inside ', wordListIn);
            Promise.resolve(wordListIn);

        }).then(lst => {
            return new Promise((resolve) => {
                resolve(lst);
            });
        })
    } catch (err) {
        console.log("\nError in GetList : ", err.message);
    }
}
