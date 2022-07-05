const express = require('express');
const path = require('path');
const body = require('body-parser');

const app = express();

app.use(body.urlencoded({extended: true}));
app.use(body.json());
app.use('/', require('./server_controller'));


// Serve only the static files form the dist directory
app.use(express.static('./dist/abpadilla'));

app.get('/*', (req, res) =>
    res.sendFile('index.html', {root: 'dist/abpadilla/'}),
);

var server = require('http').createServer(app);

// Start the app by listening on the default Heroku port
server.listen(process.env.PORT || 8080);