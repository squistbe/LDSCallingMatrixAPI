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

exports.getUnitHouseholds = function(req, res, next) {
  Unit.findOne({unitNumber: req.user.unitNumber}, function(err, unit) {
    if (err) res.send(err);
    res.json(unit.households);
  });
}

exports.getUnitMembers = function(req, res, next) {
  var searchTerm = req.query.searchTerm;

  Member.find({unitNumber: req.user.unitNumber}, function(err, members) {
    if (err) res.send(err);

    if (searchTerm) {
      var filterMembers = members.filter(function(member) {
        return (member.name.first.toLowerCase().indexOf(searchTerm) > -1) || (member.name.last.toLowerCase().indexOf(searchTerm) > -1);
      });
      res.json(filterMembers);
    }
    else res.json(members);
  });

  // Unit.findOne({unitNumber: req.user.unitNumber}, function(err, unit) {
  //   if (err) res.send(err);
  //
  //   if (searchTerm) {
  //     var members = unit.members.filter(function(member) {
  //       return (member.name.first.toLowerCase().indexOf(searchTerm) > -1) || (member.name.last.toLowerCase().indexOf(searchTerm) > -1);
  //     });
  //     res.json(members);
  //   }
  //   else res.json(unit.members);
  // });
}

exports.getUnitById = function(req, res, next) {
  Unit.findOne(function(err, units) {
    if (err) res.send(err);
    res.json(units);
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
