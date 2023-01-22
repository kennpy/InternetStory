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
const { Server } = require("socket.io");

const createServer  = require("http").createServer;


const PORT = 3200;
const helmet = require('helmet');


// const process = require('process');

// SECURITY
// cleans req.body

// sets various headers for every req, response cycle
// helper functions
const { wordIsValid } = require("/Users/kenjismith/Programming/personal/internet-story/server/helpers/helpers.js");
const { error } = require('console');

// add safety
app.use(helmet());


// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended : false}));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());
// cors middleware since frontend and backend are on different ports
app.use(cors());


// prevent client side scripts from accessing cookies
// app.use(session({
//     secret: "secret",
//     cookie: {
//         httpOnly: true,
//         secure: true
//     }
// }))

// LISTEN

const httpServer = createServer();

// SOCKETS
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials:true
        }
});
io.on('connection', (socket) => {
    console.log('a user connected');
    // send back the word data
    // (default for now)
    const wordDataQuery = "SELECT * FROM wordInfo";

    DBconnection.query(wordDataQuery, (err, results) => {
        if (err) {
          return error.message;
        }
        socket.emit("newcon", (results));
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('new word', async (newWord) => {
        console.log(newWord);
        console.time('start');
    // get the word
    const word = newWord.Word;
    const user = newWord.User;
    const message = newWord.Message;

    console.log("body values : ", word, user , message);

    // check if it is valid
    const validArr = await Promise.all([wordIsValid(word), wordIsValid(user), wordIsValid(message)]);
    const validity = validArr.every(elem => elem === true);
    // let validity = await wordIsValid(word);
    console.log("validity to return : ", validity);

    // if valid send it back
    if(validity == true){
        console.log("sending ", {Word : word, User : user, Message : message})
        socket.emit("add word", {Word : word, User : user, Message : message}) 
    }
    // else emit false and show invalid form
    else{
        socket.emit("show invalid form");
    }
    
        console.timeEnd('start');

    // trigger socket connection`
    // send back new word to every person that needs it (subscriber)
    // we do this instead of sending back the whole thing to save data
    // only do this if the word is valid

    // if word is valid update DB
    if (validity == true) {
        // add word to db
        const insertionArgs = `INSERT INTO wordInfo (Word, User, Message) VALUES ('${word}','${user}','${message}');`;
        DBconnection.query(insertionArgs, (err, data) => {
            if (err) console.log(err);
            console.log("Added new word to Database !");
        })
    }
    // else do nothing and return word validity

    });
});

// DB

// make connection
const DBconnection = mysql.createConnection({
    host: 'localhost',
    user: 'kenji',
    password: 'password',
    database: 'internetStory',
    port: 3306 // sql connection port must match server connection port (located in app.js)
    // port : 3200;
}); 

// make a connection so now we can 
// 1: add words
// 2: get table (and display it to user)
// we should parse this on backend so data is easier to send

DBconnection.connect((con_err) => {
    if (con_err) {
        console.error('error connection : ', con_err);
    }
    console.log('connected as id ', DBconnection.threadId);

    console.log("BEFORE\n")
    // get the current story stroed in db
    let wordDataQuery = "SELECT * FROM wordInfo";
    DBconnection.query(wordDataQuery, (query_err, results) => {
        if (query_err) {
            console.error("error when trying to query : ", query_err)
        }
        // console.log("word data returned from query : ", results);
        // console.log("first word results[0].Word : ", results[0].Word);
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

// send the current story and await for their submission
// for now we are just sending db data -- later we will send both the data and page info to be biilt together (but idk how to serve the react project itself so we are just seperating these for now)
router.get('/getAllWords', (req, res) => {
    // check if we need to send back list of word info

    // get the current story stroed in db
    const wordDataQuery = "SELECT * FROM wordInfo";
    DBconnection.query(wordDataQuery, (err, results, fields) => {
        if (err) {
          res.json(error.message);
        }
        res.json(results);
      });
     // send it to user

    // concurrency / timing will  be handled with web sockets
    // see if this is a problem with web sockets / connection pooling

    // submission restriction will happen in frontend with button disable (based on timer)
    // we'll store this in broswer to make this easier (using session) -- dont need security

    // limit connections based on pooling / resources (how does this relate to aws charge -- or whatever server we are using)



});

// parses word and checks if valid
// returns true if valid false if invalid
router.post('/addWord', async (req, res) => {
    console.time('start');
    // get the word
    const word = req.body.Word;
    const user = req.body.User;
    const message = req.body.Message;

    console.log("request body : ", req.body)
    console.log("body values : ", word, user , message);

    // check if it is valid
    const validArr = await Promise.all([wordIsValid(word), wordIsValid(user), wordIsValid(message)]);
    const validity = validArr.every(elem => elem === true);
    // let validity = await wordIsValid(word);
    console.log("validity to return : ", validity);

    // send it back
    res.setHeader('Content-Type', 'application/json');
    res.json({
        validWord: validity
    });
    
    console.timeEnd('start');

    // trigger socket connection`
    // send back new word to every person that needs it (subscriber)
    // we do this instead of sending back the whole thing to save data
    // only do this if the word is valid

    // if word is valid update DB
    if (validity == true) {
        // add word to db
        const insertionArgs = `INSERT INTO wordInfo (Word, User, Message) VALUES ('${word}','${user}','${message}');`;
        DBconnection.query(insertionArgs, (err, data) => {
            if (err) console.log(err);
            console.log("Added new word to Database !");
        })
    }
    // else do nothing and return word validity
})

// catcher route for all invalid requests
router.get('*', (req, res) => {
    res.send("<b>That is not a valid route, sorry !<b>");
});

// SOCKET CONNECTION

module.exports = router;

httpServer.listen(PORT, () => {
    console.log("Listening on port ", PORT);
});

