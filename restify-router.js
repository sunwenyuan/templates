module.exports = function(req, res, next){
  PortalListModel.find({}, function(err, response){
    var result = [];

    _.forEach(response, function(portal){
      result.push({
        name: portal.name,
        id: portal.id,
        icon: portal.content.icon,
        active: portal.active
      });
    });

    res.send(200, result);
  });

  return next();
};
