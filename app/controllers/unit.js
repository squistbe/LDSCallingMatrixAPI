var Unit = require('../models/unit'),
    User = require('../models/user'),
    Org = require('../models/org'),
    Member = require('../models/member'),
    organizations = require('../../config/organizations');

function setUnitInfo(unit) {
  return {
    _id: unit._id,
    name: unit.name,
    unitNumber: unit.unitNumber,
    ownerId: unit.ownerId
  };
}

exports.getUnitMembers = function(req, res, next) {
  var searchTerm = req.query.searchTerm || '';

  Member
  .aggregate([
    { $match: { unitNumber: req.user.unitNumber } },
    { $sort: { 'name.last': 1 } },
    { $project: { name: { $concat: [ '$name.first', ' ', '$name.last' ] }, phone: '$phone', email: '$email' } },
    { $match: { name: { $regex: searchTerm, $options: 'i' } } }
  ])
  .exec(function(err, members) {
    if (err) res.send(err);

    res.json(members);
  });
}

exports.createUnit = function(req, res, next) {
  User.findById(req.body.ownerId, function(err, foundUser) {
    if(err) return next(err);
    if(foundUser && foundUser.unitNumber) return res.status(422).send({error: 'You already have a Ward.'})

    if(foundUser) {
      var newUnit = new Unit({
        name: req.body.name,
        unitNumber: req.body.unitNumber,
        ownerId: foundUser._id,
        orgs: organizations
      });

      newUnit.save(function(err, result) {
        if(err) return next(err);

        foundUser.unitNumber = result.unitNumber;
        foundUser.save();
        res.status(201).json(newUnit);
      });
    }
  });
}

exports.deleteUnit = function(req, res, next) {
  Unit.remove({
    _id : req.params.org_id
  }, function(err, org) {
    res.json(org);
  });
}
