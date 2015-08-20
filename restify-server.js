/**
 * Created by wenyuan on 2015-03-26.
 */
var restify = require('restify');
var fs = require('fs');
var https = require('https');
var querystring = require('querystring');
var db = require('./db/index.js');
var router = require('./router/index');
var bunyan = require('bunyan');
var configPath = './config/';

var config = {
  port: 8091
};

var server = restify.createServer({
  certificate: fs.readFileSync('./certificates/foo.crt'),
  key: fs.readFileSync('./certificates/foo.key')
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

restify.CORS.ALLOW_HEADERS.push('authorization');
server.use(restify.CORS());
server.use(restify.fullResponse());

function authorization(req, res, next){
  if(req.headers.authorization === undefined){
    res.send(400, {
      code: 1,
      message: 'Token is missing'
    });
  }
  else{
    var configFile = configPath + 'oauth_config.json';
    var config = JSON.parse(fs.readFileSync(configFile, {encoding: 'utf8'}));
    var server = config.server;
    var port = config.port;

    var postData = querystring.stringify({
      'token': req.headers.authorization,
      'object': 'rs_request',
      'operation': 'any_operation'
    });

    var options = {
      hostname: server,
      port: port,
      path: '/oauth/authorize',
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    };

    var oauthReq = https.request(options, function(oauthRes){
      var statusCode = oauthRes.statusCode;
      if(statusCode === 200){
        next();
      }
      else{
        oauthRes.setEncoding('utf8');
        oauthRes.on('data', function(chunk){
          if(this.statusCode === 404){
            res.send(401, {
              code: 2,
              message: 'No connection to authorisation service.'
            });
          }
          else{
            res.send(this.statusCode, JSON.parse(chunk));
          }
        });
      }
    });

    oauthReq.on('error', function(){
      res.send(401, {
        code: 3,
        message: 'No connection to authorisation service.'
      });
    });

    oauthReq.write(postData);
    oauthReq.end();
  }
}

// routers for portal
server.get('/portals', authorization, router.portal.list);
server.get('/portals/:id', authorization, router.portal.getPortal);
server.post('/portals', authorization, router.portal.createPortal);
server.put('/portals/:id', authorization, router.portal.updatePortal);
server.del('/portals/:id', authorization, router.portal.deletePortal);

// routers for dir
server.get('/dirs/:portalId', authorization, router.dir.list);
server.get('/dirs/:portalId/:id', authorization, router.dir.getDir);
server.post('/dirs/:portalId', authorization, router.dir.createDir);
server.put('/dirs/:portalId/:id', authorization, router.dir.updateDir);
server.del('/dirs/:portalId/:id', authorization, router.dir.deleteDir);
server.patch('/dirs/:portalId/:id', authorization, router.dir.moveDir);

// routers for view
server.get('/views/:portalId', authorization, router.view.list);
server.get('/views/:portalId/:id', authorization, router.view.getView);
server.post('/views/:portalId', authorization, router.view.createView);
server.put('/views/:portalId/:id', authorization, router.view.updateView);
server.del('/views/:portalId/:id', authorization, router.view.deleteView);
server.patch('/views/:portalId/:id', authorization, router.view.moveView);
server.get('/views/:portalId/:id/getpath', authorization, router.view.getPath);

// routers for data group
server.get('/dgs/:portalId', authorization, router.dg.list);
server.get('/dgs/:portalId/:id', authorization, router.dg.getDataGroup);
server.post('/dgs/:portalId', authorization, router.dg.createDataGroup);
server.put('/dgs/:portalId/:id', authorization, router.dg.updateDataGroup);
server.del('/dgs/:portalId/:id', authorization, router.dg.deleteDataGroup);

// routers for user
server.get('/users', authorization, router.user.list);
server.get('/users/:query', authorization, router.user.getUser);
server.post('/users', authorization, router.user.createUser);
server.del('/users/:id', authorization, router.user.deleteUser);
server.put('/users/:id', authorization, router.user.updateUser);

server.on('after', restify.auditLogger({
  log: bunyan.createLogger({
    name: 'resourceService',
    stream: process.stdout
  })
}));

server.listen(config.port, function(){
  console.log("%s listening at %s", server.name, server.url);
});
