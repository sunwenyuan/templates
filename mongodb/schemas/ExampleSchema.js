/**
 * Created by wenyuan on 2015-04-17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ExampleSchema = new Schema({
    createTime: {
        type: Date,
        default: Date.now
    },
    lastModifyTime: {
        type: Date,
        default: Date.now
    },
    name: String,
    content: Schema.Types.Mixed,
    active: {
        type: Boolean,
        default: true
    }
});

module.exports = ExampleSchema;
