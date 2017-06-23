const bodyParser    = require('body-parser');
const dotenv        = require('dotenv');
const express       = require('express');
const fs            = require('fs')

/**********************************************************
 *                                                        *
 *            APP ENVIROMENT VARIABLES LOADER             *
 *                                                        *
 **********************************************************/
const environment   = process.env.NODE_ENV || 'dev';
dotenv.load({path: `.env.${environment}`});

/**********************************************************
 *                                                        *
 *                 EXPRESS CONFIGURATION                  *
 *                                                        *
 **********************************************************/
const PORT              = process.env.PORT || 3000;
const app               = express();
const kafkaController   = require('./controllers/kafka.controller');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(require('./config/allowCors'));

function index(req, res) {
    fs.readFile(__dirname + '/index.html', function(err, data){
    res.writeHead(200);
        res.end(data);
    });
}



/**
 * SOCKET IO CONFIG
*/
const server            = require(process.env.PROTOCOL).Server(app);
const socketIOConfig    = require('./config/socket.io.config');
const io                = require('socket.io')(server);

socketIOConfig.init(io);

/**
 * ROUTES
*/
app.post('/api/kafka/send', kafkaController.sendMessage);
app.get('/', index);

server.listen(PORT, () => {
    console.log(`Backend is running on port: ${PORT}`);
});

module.exports = app;