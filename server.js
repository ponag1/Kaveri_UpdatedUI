// Get dependencies
const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');

//require the express router
var router = express.Router();

// Get our API routes
const kaveri_api = require('./server/routes/kaveri_api');
const mojani_api = require('./server/routes/mojani_api');
const login_api = require('./server/routes/login_api');


//Middle ware for CORS
app.use(cors());

//create a cors middle ware for file upload
app.use(function(req, res, next) {
  //set headers to allow cross origin request.
      res.header("Access-Control-Allow-Origin", "*");
      res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
  });

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

// Set our API routes based on application routes
app.use('/login', login_api);
app.use('/manageLandRecords', mojani_api);
app.use('/manageKaveriRecords', kaveri_api);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || process.env.VCAP_APP_PORT || '3300';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));