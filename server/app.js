const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3200;
const index = require("./routes/index");
const helmet = require('helmet');

// MIDDELWARE
