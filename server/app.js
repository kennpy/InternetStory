const express = require('express');
const session = require('express-session');

const app = express();
const PORT = 3200;
const index = require("./routes/index");
const helmet = require('helmet');

// initialize routes
app.use(index);
// add safety
app.use(helmet());

// prevent client side scripts from accessing cookies
app.use(session({
    secret: "secret",
    cookie: {
        httpOnly: true,
        secure: true
    }
}))

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})