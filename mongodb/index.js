/**
 * Created by wenyuan on 2015-03-26.
 */
var mongoose = require('mongoose');
var config = {
    host: 'localhost',
    port: '27017',
    db: 'io'
    //user: 'oss',
    //pwd: 'oss'
};

var url;
if(config.user){
    url = 'mongodb://'+config.user+':'+config.pwd+'@'+config.host+':'+config.port+'/'+config.db;
}
else{
    url = 'mongodb://'+config.host+':'+config.port+'/'+config.db;
}

var db = mongoose.createConnection(url, {poolSize: 10});

module.exports.connection = db;
module.exports.Schemas = require('./schemas/index.js');

var models = {};

module.exports.getModel = function(collectionName, schema){
    if(models[collectionName] === undefined){
        models[collectionName] = db.model(collectionName, schema);
    }
    return models[collectionName];
};
