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
// SOCKET CONNECTION

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials:true
        }, 
        
});

// DB CON

// make connection
const DBconnection = mysql.createConnection({
    host: 'localhost',
    user: 'kenji',
    password: 'password',
    database: 'internetStory',
    port: 3306 // sql connection port must match server connection port (located in app.js)
    // port : 3200;
}); 

DBconnection.connect((con_err) => {
    if (con_err) {
        console.error('error connection : ', con_err);
    }
    console.log('connected as id ', DBconnection.threadId);
}); 

// SOCKETS


let conCount = 0;
io.on('connection', (socket) => {
    console.log('a user connected', conCount++);

    // send back all words
    const allWordsQuery = "SELECT * FROM wordInfo";
    sendEntireTable(allWordsQuery, socket);

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('new word', async (newWord) => {
        const word = newWord.Word;
        const user = newWord.User;
        const message = newWord.Message;
        
        // check if it is valid
        const submissionIsValid = await checkSubmissionValidity(word, user, message);

        // if valid send it back and add to database
        if(submissionIsValid){
            socket.emit("add word", {Word : word, User : user, Message : message}) 
            addWordToDatabase(word, user, message);

        }
        // else emit false to show invalid form and do not add it to databse
        else{
            socket.emit("show invalid form");
        }
        });
});

// note : we are not closing mysql connection since app 'never stops' -- only when server stops but then everything is down

module.exports = router;

httpServer.listen(PORT, () => {
    console.log("Listening on port ", PORT);
});

async function checkSubmissionValidity(word, user, message) {
    const validArr = await Promise.all([wordIsValid(word), wordIsValid(user), wordIsValid(message)]);
    const validity = validArr.every(elem => elem === true);
    return validity;
}

function addWordToDatabase(word, user, message) {
    const insertionArgs = `INSERT INTO wordInfo (Word, User, Message) VALUES ('${word}','${user}','${message}');`;
    DBconnection.query(insertionArgs, (err, data) => {
        if (err)
            console.log(err);
        console.log("Added new word to Database !");
    });
}

function sendEntireTable(wordDataQuery, socket) {
    DBconnection.query(wordDataQuery, (err, results) => {
        if (err) {
            return error.message;
        }
        socket.emit("newcon", (results));
    });
}

