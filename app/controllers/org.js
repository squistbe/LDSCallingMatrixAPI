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

function findOrg(unit, orgId) {
  return unit.orgs.find(function(org) {
    return org._id.equals(orgId);
  });
}

exports.getOrgs = function(req, res, next) {
  var query = {unitNumber: req.user.unitNumber},
      filterByOrg = req.query.filterByOrg,
      filterByStatus = req.query.filterByStatus,
      vacantCallings = req.query.vacantCallings == 'true';

  Unit
  .findOne(query)
  .populate('orgs.callings.member')
  .populate('orgs.callings.status')
  .sort('orgs.sortIndex')
  .exec(function(err, unit) {
    if (err) res.send(err);

    var orgs = unit.orgs,
        filteredOrgs = [];

    if (filterByOrg) {
      orgs = orgs.filter(function(org) { return ~this.indexOf(org._id.toString()) }, filterByOrg.split(','));
    }

    orgs.forEach(function(org) {
      var copy = org.toObject();

      if (vacantCallings) {
        copy.callings = copy.callings.filter(function(calling) {return !calling.member;});
      }

      if (filterByStatus) {
        copy.callings = copy.callings.filter(function(calling) {
          return calling.status && !!~filterByStatus.split(',').indexOf(calling.status._id.toString());
        });
      }

      copy.callings.sort(function(a, b) {
        return a.sortIndex - b.sortIndex;
      });

      if (req.query && copy.callings.length) filteredOrgs.push(copy);
    });

    res.json(filteredOrgs);
  });
}

exports.reorderOrgs = function(req, res, next) {

  Unit
  .findOne({unitNumber: req.user.unitNumber})
  .sort('orgs.sortIndex')
  .exec(function(err, unit) {
    if (err) res.send(err);

    var org = findOrg(unit, req.body.orgId);

    // reorder callings and update the sortIndex
    org.callings.splice(req.body.to, 0, org.callings.splice(req.body.from, 1)[0]);
    org.callings.forEach(function(calling, i) {
      calling.sortIndex = i;
    });

    unit.save(function(err, unit) {
      if (err) res.send(err);

      Unit.populate(unit, 'orgs.callings.member orgs.callings.status', function(err, found) {
        if (err) res.send(err);

        res.json(found.orgs);
      });
    });
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

    statuses.forEach(function(status) {
      status.type = req.query.type;
    });
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
