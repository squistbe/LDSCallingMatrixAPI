var Org = require('../models/org'),
    User = require('../models/user');

function setOrgInfo(org) {
  return {
    _id: org._id,
    name: org.name,
    unitNumber: org.unitNumber,
    ownerId: org.ownerId
  };
}

exports.getOrgs = function(req, res, next) {
  Org.find(function(err, todos) {
    if (err) res.send(err);
    res.json(todos);
  });
}

exports.getOrgById = function(req, res, next) {
  Org.findOne(function(err, todos) {
    if (err) res.send(err);
    res.json(todos);
  });
}

exports.createOrg = function(req, res, next) {
  User.findById(req.body.ownerId, function(err, foundUser) {
    if(err) return next(err);
    if(foundUser && foundUser.orgId) return res.status(422).send({error: 'You already have a Ward.'})

    if(foundUser) {
      var newOrg = new Org({
        name: req.body.name,
        unitNumber: req.body.unitNumber,
        ownerId: foundUser._id
      });

      newOrg.save(function(err, result) {
        if(err) return next(err);

        foundUser.orgId = result._id;
        foundUser.save();
        res.status(201).json(newOrg);
      });
    }
  });
}

exports.deleteOrg = function(req, res, next) {
  Org.remove({
    _id : req.params.org_id
  }, function(err, org) {
    res.json(org);
  });
}
