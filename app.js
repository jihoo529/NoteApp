var express = require('express'); 
var path = require('path');
var app = express();
var monk = require('monk');
var db = monk('127.0.0.1:27017');
var notes_router = require('./routes/notes');
var session = require('express-session');
var cors = require('cors');
//import { ObjectId } from 'mongodb';

app.use(express.json());

app.use(function(req,res,next){
    req.db = db;
    next();
});



var corsOption = {
  origin: ['http://127.0.0.1:3000', 'http://localhost:3000'],
  credentials: true
};

//app.use(cors(corsOption));
app.use(session({
  secret: 'random_string_goes_here', 
  resave: true,
  saveUninitialized: true
}));
//app.options('http://127.0.0.1:3000', cors(corsOption));
//app.options('*', cors(corsOption));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsOption));
app.use('/', notes_router);
/*app.get('/', (req, res) => {
    res.send('Hello World!')
  })*/
  
var server = app.listen(3001, () => {
	var host = server.address().address
	var port = server.address().port
	console.log("A2 app listening at http://%s:%s", host, port)
});