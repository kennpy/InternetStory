const fs = require('fs');
const xss = require('xss');
const validator = require('validator');
const path = require('path');
const csv = require('fast-csv');
const { once } = require('events');

const TERMS_BLOCK_CSV = "/Users/kenjismith/Programming/personal/internet-story/server/helpers/Terms-to-Block.csv";
const TERMS_BLOCK_JSON = "/Users/kenjismith/Programming/personal/internet-story/server/helpers/naughtyList2.json";
const BAD_WORD_CSV_KEY = 'FrontGate Media,Your Gateway to the Chrisitan Audience';
const WHITE_LISTED_WORDS = ['a', 'i', 'ad', 'am', 'as', 'at', 'be', 'by', 'do', 'go'
    , 'he', 'hi', 'hey', 'id', 'if', 'in', 'is', 'it', 'me', 'my', 'no', 'of', 'oh', 'ok', 'as'
    , 'an', 'and', 'to', 'up', 'so', 'we', 'us', 'or', 'pi', 'ha', 'on', 'by', 'ad', '.'];


// WORD VALIDITY

/**
 * Verifies word is not racist, vulgar, or link
 * @param {string} word - a word to verify
 * @returns {boolean} - whether the word is allowed or not
 */
const wordIsValid = async (word) => {

    // if the word is empty (only space) return false
    const strOnlyHasSpaces = word.trim().length == 0;
    if (strOnlyHasSpaces) return false;

    // perform our additional checks
    word = cleanXSS(word);
    let wordIsRegex = wordWasRegex(word);
    let isAcceptableWord;
    let wordIsWeird;

    // if word is regex return false immediately so no nalicious code can be ran 
    if (wordIsRegex) return false;
    else {
        isAcceptableWord = await wordIsNaughty(word).catch((err) => {
            console.log("error that was catched : ", err);
        });
        wordIsWeird = performRandomChecks(word);
    }
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
const performRandomChecks = (word) => {
    // removed : v.isIdentityCard , validator.isJWT (made spaces invalid for some reason)
    let listOfCheckers = [validator.isBtcAddress, validator.isEAN, validator.isEmail, validator.isFQDN, validator.isIBAN, validator.isIP, validator.isISBN, validator.isIPRange, validator.isMobilePhone, validator.isEthereumAddress, validator.isJSON, validator.isLatLong, validator.isMACAddress, validator.isMongoId, validator.isUUID];

    for (const element of listOfCheckers) {
        let currentCheckValidity = element;
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
        // check if word in list of bad words
        let badListOne = await convertCsvToList(TERMS_BLOCK_CSV)

        let badListTwo = await convertJsonToList(TERMS_BLOCK_JSON);

        let validity = checkNaughtyValidity(badListOne, badListTwo, word);
        return validity;

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
    while (counter < WHITE_LISTED_WORDS.length && !isWhiteListed) {
        let whiteListedWord = WHITE_LISTED_WORDS[counter];
        isWhiteListed = caseInsensitiveEquals(whiteListedWord, word);
        counter++;
    }

    // if its not in whitelist perform substring checks else return true
    if (!isWhiteListed) {

        // check vaildity for first array
        for (const element of listOne) {
            let currentWord = element;
            // if word is greater than 3 check for substring else check directly
            // we do this so no words like a get checked -- a would be considered invalid as its a substring
            // of many of the words, so for words smaller than 3 we check directly else look for nested

            if (word.toLowerCase().includes(currentWord.toLowerCase())) {
                return false
            }
        }
        // console.log(listTwo);
        // check for second array
        for (const element of listTwo) {
            let currentWord = element;
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
    
    let newWord = oldWord.replace(/[^0-9a-z-A-Z.(): ]/g, "").replace(/ +/, " ");
    console.log("after regex check  SAME: ", oldWord === newWord);

    // if not changes were made we now it is not regex, else it is
    return (oldWord === newWord) ? false : true;
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
    try {
        let newlyMadeList = await getListFromCsv();
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

async function getListFromCsv() {
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
                let res = replaceAll(row[BAD_WORD_CSV_KEY], ",", "");
                wordList.push(res);
            })
            .on('end', (rowCount) => {
                console.log(`Parsed ${rowCount} rows`)
            })

        await once(stream, 'finish');

        // remove the first 3 elements
        const numToDelete = 3
        if (wordList.length > numToDelete) {
            for (let i = 0; i < numToDelete; i++) {
                wordList.shift();
            }
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
wordIsValid("hello . ");

module.exports = { wordIsValid };

