const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3200;
const index = require("./routes/index");
const helmet = require('helmet');


// MIDDELWARE

// initialize routes
app.use(index);
// add safety
app.use(helmet());
// so we can serve react files
//app.use(express.static(path.join("src")));
console.log(__dirname)

// prevent client side scripts from accessing cookies
app.use(session({
    secret: "secret",
    cookie: {
        httpOnly: true,
        secure: true
    }
}))

// LISTEN

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})
