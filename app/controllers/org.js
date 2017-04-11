var Calling = require('../models/calling'),
    Org = require('../models/org'),
    Unit = require('../models/unit'),
    CallingStatus = require('../models/callingStatus'),
    organizations = require('../../config/organizations'),
    ObjectId = require('mongodb').ObjectId,
    callingUtils = require('../utils/calling');

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

exports.getOrgCallings = function(req, res, next) {
  var org = organizations.find(function(item) {
    return item.name === req.query.name;
  });

  if (org) res.send(org.callings)
  else res.status(404).send('Organization not found.')
}

exports.addOrgCalling = function(req, res, next) {
  var query = {
        unitNumber: req.user.unitNumber,
        'orgs._id': ObjectId(req.params.orgId)
      },
      newCalling = new Calling({
        name: req.body.name
      });

  Unit
  .findOne(query, {
    'orgs.$.callings': 1
  })
  .exec(function(err, result) {
    if (err) res.send(err);

    if (result.orgs[0]) {
      newCalling.sortIndex = result.orgs[0].callings.length;
      Unit
      .findOneAndUpdate(query, {
        $push: {
          'orgs.$.callings': newCalling
        }
      }, {
        new: true
      })
      .exec(function(err, doc) {
        if (err) res.send(err);

        res.status(201).send(newCalling);
      });
    }
  });
}

exports.removeOrgCalling = function(req, res, next) {
  Unit
  .update({
    unitNumber: req.user.unitNumber,
    'orgs._id': ObjectId(req.params.orgId)
  }, {
    $pull: {
      'orgs.$.callings': {
        _id: ObjectId(req.params.callingId)
      }
    }
  })
  .exec(function(err, doc) {
    if (err) res.send(err);

    res.status(204).send();
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

exports.updateOrgCalling = function(req, res, next) {
  var orgId = req.params.orgId,
      callingId = req.params.callingId,
      memberId = req.body.memberId,
      statusId = req.body.statusId,
      className = req.body.className;

  Unit
  .findOne({unitNumber: req.user.unitNumber})
  .exec(function(err, unit) {
    if (err) res.send(err);

    var calling = callingUtils.findCalling(unit, {orgId: orgId, callingId: callingId});

    if (calling) {
      if (memberId) {
        if (calling.member) calling.status = undefined;
        calling.member = memberId;
      }
      if (statusId) calling.status = statusId;
      if (className) calling.className = className;

      unit.save(function(err, unit) {
        if (err) res.send(err);

        Calling.populate(calling, 'member status', function(err, found) {
          if (err) res.send(err);

          res.json(found);
        })
      });
    }
    else res.status(422).send('Calling Not Found');
  });
}

exports.removeMemberFromCalling = function(req, res, next) {
  Unit
  .findOne({
    unitNumber: req.user.unitNumber,
    'orgs._id': ObjectId(req.params.orgId),
    'orgs.callings._id': ObjectId(req.params.callingId)
  }, {
    'orgs.$.callings': 1
  })
  .exec(function(err, unit) {
    if (err) res.send(err);

    var calling = unit.orgs[0].callings.find(function(item) {return item._id.equals(req.params.callingId)});

    if (calling) {
      calling.member = undefined;
      calling.status = undefined;

      unit.save(function(err, unit) {
        if (err) res.send(err);

        res.json(calling);
      });
    }
    else res.status(422).send('Calling Not Found');
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
