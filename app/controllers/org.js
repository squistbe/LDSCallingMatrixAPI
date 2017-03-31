var Calling = require('../models/calling'),
    Org = require('../models/org'),
    Unit = require('../models/unit'),
    CallingStatus = require('../models/callingStatus');

function findCalling(unit, data) {
  var calling;

  unit.orgs.forEach(function(org) {
    var foundOrg = org._id.equals(data.orgId);

    if (foundOrg) {
      calling = org.callings.find(function(calling) {
        return calling._id.equals(data.callingId);
      });
    }
  });

  return calling;
}

exports.getOrgs = function(req, res, next) {
  Unit
  .findOne({unitNumber: req.user.unitNumber})
  .populate('orgs.callings.member')
  .populate('orgs.callings.status')
  .sort('orgs.sortIndex')
  .exec(function(err, unit) {
    if (err) res.send(err);

    var orgs = unit.orgs;

    orgs.forEach(function(org) {
      var copy = org.toObject();
      copy.callings.sort(function(a, b) {
        return a.sortIndex - b.sortIndex;
      });
      org.callings = copy.callings;
    });

    res.json(orgs);
  });
}

exports.updateCalling = function(req, res, next) {
  Unit.findOne({unitNumber: req.user.unitNumber}, function(err, unit) {
    if (err) res.send(err);

    var calling = findCalling(unit, req.body);

    if (req.body.memberId) calling.member = req.body.memberId;
    if (req.body.statusId) calling.status = req.body.statusId;

    unit.save(function(err, unit) {
      if (err) res.send(err);

      Calling.populate(calling, 'member status', function(err, found) {
        if (err) res.send(err);

        res.json(found);
      })
    });
  });
}

exports.removeMemberFromCalling = function(req, res, next) {
  Unit.findOne({unitNumber: req.user.unitNumber}, function(err, unit) {
    if (err) res.send(err);

    var calling = findCalling(unit, req.body);
    calling.member = undefined;
    calling.status = undefined;

    unit.save(function(err, unit) {
      if (err) res.send(err);

      res.json(calling);
    });
  });
}

exports.getCallingStatuses = function(req, res, next) {
  CallingStatus
  .find()
  .sort('sortIndex')
  .exec(function(err, statuses) {
    if (err) res.send(err);

    res.json(statuses);
  });
}

exports.updateCallingStatus = function(req, res, next) {
  Unit.findOne({unitNumber: req.user.unitNumber}, function(err, unit) {
    if (err) res.send(err);

    var calling = findCalling(unit,req.body);
    calling.status = req.body.statusId;

    unit.save(function(err, unit) {
      if (err) res.send(err);

      Calling.populate(calling, {path: 'status'}, function(err, found) {
        if (err) res.send(err);

        res.json(found);
      });
    });
  })
}
