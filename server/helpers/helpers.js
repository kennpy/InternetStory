const fs = require('fs');
// const csvParser = require("csv-parser");
const xss = require('xss');

const validator = require('validator');

const path = require('path');
const csv = require('fast-csv');

const { once } = require('events');


const CSV_FILE_PATH = "/Users/kenjismith/Programming/personal/internet-story/server/helpers/Terms-to-Block.csv";
const NAUGHTY_LIST_FILE_PATH = "/Users/kenjismith/Programming/personal/internet-story/server/helpers/naughtyList2.json";
const badWordKey = 'FrontGate Media,Your Gateway to the Chrisitan Audience';

const whitelistedLowerCase = ['a', 'i', 'ad', 'am', 'as', 'at', 'be', 'by', 'do', 'go'
    , 'he', 'hi', 'hey', 'id', 'if', 'in', 'is', 'it', 'me', 'my', 'no', 'of', 'oh', 'ok', 'as'
    , 'an', 'and', 'to', 'up', 'so', 'we', 'us', 'or', 'pi', 'ha', 'on', 'by', 'ad'];


// TOP CHECKER

/**
 * Verifies word is not racist, vulgar, or link
 * @param {string} word - a word to verify
 * @returns {boolean} - whether the word is allowed or not
 */
const wordIsValid = async (word) => {

    word = cleanXSS(word);
    let wordIsRegex = wordWasRegex(word);
    let isAcceptableWord;
    let wordIsWeird;

    if (wordIsRegex) return false;
    else {
        isAcceptableWord = await wordIsNaughty(word).catch((err) => {
            console.log("error that was catched : ", err);
        });
        console.log("AT TOP LEVEL VALIDITY after first pass IS : ", isAcceptableWord)
        wordIsWeird = performRandomChecks(word);
    }



    console.log("word is acceptable : ", isAcceptableWord);
    console.log("word is regex : ", wordIsRegex);
    console.log("word is weird : ", wordIsWeird);
    console.log("word after preventXSS : ", word);


    // check if word is a url

    if (!isAcceptableWord) return false;
    if (wordIsWeird) return false;

    return true;
}


// HELP CHECKERS

/**
 * Checks if word is a url
 * @param {string} word
 * @returns {bool} isUrl
 */
const performRandomChecks = function (word) {
    // removed : v.isIdentityCard , 
    let listOfCheckers = [validator.isBtcAddress, validator.isEAN, validator.isEmail, validator.isFQDN, validator.isIBAN, validator.isIP, validator.isISBN, validator.isIPRange, validator.isMobilePhone, validator.isEthereumAddress, validator.isJWT, validator.isJSON, validator.isLatLong, validator.isMACAddress, validator.isMongoId, validator.isUUID];

    for (let i = 0; i < listOfCheckers.length; i++) {
        let currentCheckValidity = listOfCheckers[i];
        if (currentCheckValidity(word)) {
            return true
        }
    }
    return false;

}

/**
 * Checks if word is bad word (from list of bad words)
 */
async function wordIsNaughty(word) {
    try {
        console.log("NEW ENTRY \n\n\n\n\n\n\n");
        // check if word in list of bad words

        //let badListOne = await convertCsvToList(CSV_FILE_PATH);
        // let badLists = await Promise.all([convertCsvToList(CSV_FILE_PATH), convertJsonToList(NAUGHTY_LIST_FILE_PATH)]).then((data) => console.log("\n\nReturned bad lists\n\n : ", data));
        let badListOne = await convertCsvToList(CSV_FILE_PATH)
        console.log("wordIsBad --> covertCSVToList returns ", badListOne.length);

        let badListTwo = await convertJsonToList(NAUGHTY_LIST_FILE_PATH);

        let wordIsValid = checkNaughtyValidity(badListOne, badListTwo, word);
        console.log("word validity we are returning: ", wordIsValid);
        return wordIsValid;

    } catch (err) {
        console.log("ERROR WORD_is_bad : ", err.message);
    }

}

function checkNaughtyValidity(listOne, listTwo, word) {

    // check if on whitelist
    // whitelisted words inlude "a" and "I" case insensitive
    // we do this check so no words such as "a" get included else they will be considered invalid as they are substrings

    // foreach element in whitelist compare case instensitive equals
    let isWhiteListed = false;
    let counter = 0
    while (counter < whitelistedLowerCase.length && !isWhiteListed) {
        whiteListedWord = whitelistedLowerCase[counter];
        isWhiteListed = caseInsensitiveEquals(whiteListedWord, word);
        counter++;
    }

    // if its not in whitelist perform substring checks else return true
    if (!isWhiteListed) {

        // check vaildity for first array
        for (let i = 0; i < listOne.length; i++) {
            let currentWord = listOne[i];
            // if word is greater than 3 check for substring else check directly
            // we do this so no words like a get checked -- a would be considered invalid as its a substring
            // of many of the words, so for words smaller than 3 we check directly else look for nested

            if (word.toLowerCase().includes(currentWord.toLowerCase())) {
                return false
            }
        }
        console.log(listTwo);
        // check for second array
        for (let i = 0; i < listTwo.length; i++) {
            let currentWord = listTwo[i];
            // if word is greater than 3 check for substring else check directly
            // we do this so no words like a get checked -- a would be considered invalid as its a substring
            // of many of the words, so for words smaller than 3 we check directly else look for nested

            if (word.toLowerCase().includes(currentWord.toLowerCase()) && currentWord != '') {
                return false
            }
        }

        return true;
    }

    // return true since we know it is whitelisted (case insensitive)
    else {
        return true;
    }

}

/**
 * Checks if word is a regex expressoin (these are bad since they can cause errors)
 */
function wordWasRegex(oldWord) {
    // var scriptRegexTwo = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    // let newWord = oldWord.replace(/[|&;$%@"<>()+,]/g, "");
    // newWord = newWord.replace(scriptRegexTwo, "");

    let newWord = oldWord.replace(/[^0-9a-z-A-Z ]/g, "").replace(/ +/, " ");
    console.log(oldWord);
    console.log(newWord);
    console.log("after regex check  SAME: ", oldWord === newWord);


    // if not changes were made we now it is not regex, else it is
    return hadToClean = (oldWord === newWord) ? false : true;
}
/**
 * Filters word such that no XSS is possible
 */
function cleanXSS(word) {
    word = xss.filterXSS(word);
    return word;
}


// GET LISTS

/**
 * Converts csv file of words to a list 
 * @param {string} csvFilePath - the file to read from
 * @return {Array} - list of words
 */
const convertCsvToList = async (csvFilePath) => {
    console.log("INSIDE CONVERT CSV");
    try {

        let wordListOut = [];
        console.log("csvFilePath in convertCsv before insertion : ", csvFilePath);
        let newlyMadeList = await GetListFromCsv(csvFilePath);
        console.log('GetList in convertcsv returned ', newlyMadeList.length);
        return newlyMadeList;

    } catch (e) {
        console.log("\n\nERROR CSV : ", e.message);
    }
}

/**
 * Obvious 
 * @returns list 
 */
const convertJsonToList = async (filePath) => {
    try {
        let newList = [];
        const fileData = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
        fileData.split(",").forEach(str => {
            newList.push(str);
        })

        return newList;
    }
    catch (err) {
        console.log("ERROR JSON : ", err.message);
    }
}

// GENERAL HELPER SECTION

async function GetListFromCsv(csvFilePath) {
    try {

        let wordList = [];

        const parseOptions = {
            objectMode: true,
            delimiter: ";",
            quote: null,
            headers: true,
            renameHeaders: false,
        };

        const stream = fs.createReadStream((path.resolve(__dirname, 'Terms-to-Block.csv')), 'utf-8')
            .pipe(csv.parse(parseOptions))
            .on('error', error => console.error("parsing error : ", error))
            .on('data', row => {
                res = replaceAll(row[badWordKey], ",", "");
                wordList.push(res);
            })
            .on('end', (rowCount) => {
                console.log(`Parsed ${rowCount} rows`)
            })

        await once(stream, 'finish');

        // remove the first 3 elements
        const numToDelete = 3
        if (wordList.length > numToDelete);
        for (let i = 0; i < numToDelete; i++) {
            wordList.shift();
        }

        return wordList;
    }
    catch (err) {
        console.log("\nError in GetList : ", err.message);
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function caseInsensitiveEquals(a, b) {
    return typeof a === 'string' && typeof b === 'string'
        ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
        : a === b;
}


// TEST

wordIsValid("i ate 100 cats");

module.exports = { wordIsValid };

