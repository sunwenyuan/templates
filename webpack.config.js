'use strict';
var path = require('path');
var webpack = require('webpack');
var nodeModuleDir = path.join(__dirname, 'node_modules');
var libDir = path.join(__dirname, '/src/main/web/application/lib');

var deps = [
  'angular/angular.min.js'
];

var config = {
  entry: __dirname + '/src/main/web/application/loader.js',
  output: {
    path: __dirname + '/src/main/web/application',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'ng-annotate', exclude: ['node_modules', libDir]},
      { test: /\.css$/, loader: 'style!css!postcss', exclude: ['node_modules', libDir]},
      { test: /\.less$/, loader: 'style!css!less', exclude: ['node_modules', libDir]},
      { test: /\.html$/, loader: 'raw', exclude: ['node_modules', libDir]},
      { test: /\.json$/, loader: 'json', exclude: ['node_modules', libDir]},
      { test: /\.(ttf|eot|svg|woff|jpg|png).*$/, loader: 'file', exclude: ['node_modules', libDir]}
    ],
    noParse: []
  },
  devtool: 'cheap-source-map',
  resolve: {
    root: path.resolve('./src/main/web/application'),
    alias: {}
  },

  plugins: [
    new webpack.DefinePlugin({
      ON_TEST: process.env.NODE_ENV === 'test'
    })
  ],
};

// Run through deps and extract the first part of the path,
// as that is what you use to require the actual node modules
// in your code. Then use the complete path to point to the correct
// file and make sure webpack does not try to parse it
deps.forEach(function(dep){
  var depPath = path.resolve(nodeModuleDir, dep);
  config.resolve.alias[dep.split(path.sep)[0]] = depPath;
  config.module.noParse.push(depPath);
});

module.exports = config;
