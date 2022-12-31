// handles all word processing / handling and adds to frontend using websocket connection
// frontend separate from backend, in other words client served up on one server and word processing happens on another server

const express = require('express')
const router = express.Router();
const app = express()
const path = require('path');
const cors = require('cors');
// SECURITY
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

// helper functions
const { wordIsValid } = require("/Users/kenjismith/Programming/personal/internet-story/server/helpers/helpers.js");

app.use(mongoSanitize());
app.use(helmet());

// OTHER WAY TO PARESE BODIES

// Parse URL-encoded bodies (as sent by HTML forms)
router.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
router.use(express.json());

// cors middleware since frontend and backend are on different ports
router.use(cors());

// parses word and checks if valid
// returns true if valid false if invalid
router.post('/addWord', async (req, res) => {
    const word = req.body.word;
    console.log("word : ", word);

    let validity = await wordIsValid(word);
    console.log("validity to return : ", validity);

    res.setHeader('Content-Type', 'application/json');
    res.json({
        validWord: validity
    });
})

// catcher route for all invalid requests
router.get('*', (req, res) => {
    res.send("<b>That is not a valid route, sorry !<b>");
});

module.exports = router;