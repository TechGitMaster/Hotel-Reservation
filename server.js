require('dotenv').config();
const express = require('express');
const body = require('body-parser');
const connected_db = require('./nodejs/databases/database_connect');
const mongoose = require('mongoose');

const app = express();

app.use(body.urlencoded({extended: true}));
app.use(body.json());
app.use('/', require('./server_controller'));

//For file upload__________________________________________________________
app.use(express.json({ limit: '50mb' }));
app.use(body.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

app.use((req, res, next) => {
    res.setHeader('Access-Origin-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
});

// Serve only the static files form the dist directory__________________________
app.use(express.static('./dist/abpadilla'));

app.get('/*', (req, res) =>
    res.sendFile('index.html', {root: 'dist/abpadilla/'}),
);

var server = require('http').createServer(app);


//Socket io______________________________________________________
const io = require('socket.io')(server, { transports: ["websocket"] });
/*const io = require('socket.io')(server, {
	serveClient: true,
        cors: {
            origins: ['//localhost:4200']
        }
});*/

io.on('connect' || 'connection' ,(soc) => {

    soc.on('user', (data) => {
        io.emit('user', data);
    });

    //soc.emit('admin_notification', 'new');
    //soc.emit('admin_reservation', 'new');
});


// Start the app by listening on the default Heroku port__________________________
connected_db();
mongoose.connection.once('open', () => {
    server.listen(process.env.PORT || 8080);
});
