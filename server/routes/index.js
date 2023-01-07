// handles all word processing / handling and adds to frontend using websocket connection
// frontend separate from backend, in other words client served up on one server and word processing happens on another server

// for REST apis using node
const express = require('express')
// to organize our routes
const router = express.Router();
// to use our app
const app = express();
const path = require('path');
// "cross origin resource sharing" --  (frontend is running on differnt port than backend) -- share resources with frontend and backend despite being on differnt 'server'
const cors = require('cors');

const mysql = require('mysql');

// SECURITY
// cleans req.body

// sets various headers for every req, response cycle
const helmet = require('helmet');

// helper functions
const { wordIsValid } = require("/Users/kenjismith/Programming/personal/internet-story/server/helpers/helpers.js");
const { error } = require('console');

app.use(helmet());




// Parse URL-encoded bodies (as sent by HTML forms)
router.use(express.urlencoded());
// Parse JSON bodies (as sent by API clients)
router.use(express.json());
// cors middleware since frontend and backend are on different ports
router.use(cors());


// DB

// configure mysql connection
const db_config = {

}

const DBconnection = mysql.createConnection({
    host: 'localhost',
    user: 'kenji',
    password: 'password',
    database: 'internetStory',
    port: 3306 // sql connection port must match server connection port (located in app.js)
    // port : 3200;
})

// make a connection so now we can 
// 1: add words
// 2: get table (and display it to user)
// we should parse this on backend so data is easier to send

DBconnection.connect((err) => {
    if (err) {
        console.error('error connection : ', err);
    }
    console.log('connected as id ', DBconnection.threadId);

    console.log("BEFORE\n")
    // get the current story stroed in db
    let wordDataQuery = "SELECT * FROM wordInfo";
    DBconnection.query(wordDataQuery, (err, results) => {
        if (err) {
            console.error("error when trying to query : ", error)
        }
        console.log("word data returned from query : ", results[0].Word);
    })
    console.log("AFTER\n")

}); // note : we are not closing mysql connection since app 'never stops' -- only when server stops but then everything is down



// ROUTES

// upon first connect send back the entire list
// we do this since the backend holds the info, so if we try to connect without making an initial request our word list is gonna be empty since it hasnt been populated
// once its populated we only send words that we need to add back to save resources / reduce latency

// TODO : [ ]  figure out how to put frontend and backend on same server (serve react with nodejs)
//  OR :  [ ]  request initial list state from frontend then just send it back whenever we need. then frontend and backend are seperate and we can run them on seperate servers
// we would just need to prevent requesting on additional renders, since after first render all we need is word validatoin + addition
// timer gets stored in frontend using sessions. we dont need sessions for anything else

// or we would have to save in session becuase of reload -- then we are not requesting it every time the page reloads

// sessoin can store max number of bytes (5mb or so) -- this corresponds with 5,000,000 bytes of data (where each byte is a char) -- so we can store 5 million chars or an average of 1 million words 
// (local storage is proably fine as long as we rate limit / set up timer)


// send the current story and await for their submission
// for now we are just sending db data -- later we will send both the data and page info to be biilt together (but idk how to serve the react project itself so we are just seperating these for now)
router.get('/', (req, res) => {
    // get the current story stroed in db
    let wordDataQuery = "SELECT * FROM wordInfo";
    let wordData = DBconnection.query(wordDataQuery);
    console.log("word data returned from query : ", wordData.Word);
    // send it to user


})

// parses word and checks if valid
// returns true if valid false if invalid
router.post('/addWord', async (req, res) => {

    // get the word
    const word = req.body.word;
    // check if it is valid
    let validity = await wordIsValid(word);
    console.log("validity to return : ", validity);

    // send it back
    res.setHeader('Content-Type', 'application/json');
    res.json({
        validWord: validity
    });

    // trigger socket connection
    // send back new word to every person that needs it (subscriber)
    // we do this instead of sending back the whole thing to save data

    // if word is valid update DB
    if (validity == true) {
        // add the insert query
        const insertionArgs = `INSERT INTO wordInfo (Word) VALUES ('${word}');`;
        DBconnection.query(insertionArgs, (err, data) => {
            if (err) console.log(err);
            console.log("Added new word to Database !");
        })
    }
    // send it to user

    // concurrency / timing will  be handled with web sockets
    // see if this is a problem with web sockets / connection pooling

    // submission restriction will happen in frontend with button disable (based on timer)
    // we'll store this in broswer to make this easier (using session) -- dont need security

    // limit connections based on pooling / resources (how does this relate to aws charge -- or whatever server we are using)

    // else do nothing and return word validity
})

// catcher route for all invalid requests
router.get('*', (req, res) => {
    res.send("<b>That is not a valid route, sorry !<b>");
});

// SOCKET CONNECTION

module.exports = router;