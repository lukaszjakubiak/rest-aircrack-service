const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect(
    'mongodb+srv://operator:'
    + process.env.MONGO_ATLAS_PW
    + '@node-rest-shop-j3wf7.mongodb.net/test?retryWrites=true&w=majority',
    {
        // useMongoClient: true
    });

mongoose.Promise = global.Promise;


// app.all('/', function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
//     next();
//    });
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use((req, res, next) => {
    // * - any origin of request
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Header',
        'Origin, X-Request-With, Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods',
            'PUT, POST, PATCH, DELETE, GET'
        );
        return res.status(200).json({});
    }
    next();
});

// app.use('/files', express.static('uploads'));

const wpaDataRoutes = require('./api/routes/wpaData');

app.use(morgan('combined'));
// app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use('/wpaData', wpaDataRoutes);

// error request make it past upper request and end here
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    console.log(error);
    res.status(error.status || 500);
    res.json({
        error: {
            message: error
        }
    });
});


const workerOnInterval = require('./logic/WorkerOnInterval');
workerOnInterval.periodicalCheck();


module.exports = app;