

const mysql = require('mysql2');

(async () => {
    // configure mysql connection
    const DBconnection = mysql.createConnection({
        host: 'localhost',
        user: 'kenji',
        password: 'password',
        database: 'internetStory',
        port: 3306, // sql connection port must match server connection port (located in app.js)
        // debug: true
    })

    // make a connection so now we can 
    // 1: add words
    // 2: get table (and display it to user)
    // we should parse this on backend so data is easier to send

    console.log("attempting to connect");
    DBconnection.connect((err) => {
        if (err) {
            console.error('\n\n\n\n\nerror connection : \n\n\n\n\n\n', err);
        }
        console.log('connected as id ', DBconnection.threadId);
    }); // note : we are not closing mysql connection since app 'never stops' -- only when server stops but then everything is down
})();