/**
 * Created by sunwenyuan on 11/08/15.
 */
'use strict';
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var morgan = require('morgan');

var app = express();
app.set('views', path.join(__dirname, 'public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(errorHandler());
app.use(morgan());

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.send(500, 'Something broke!');
});

app.get('/', function(req, res){
    res.send('index.html');
});

var server = app.listen(8080, function(){
    console.log('Listening on port %d', server.address().port);
});
