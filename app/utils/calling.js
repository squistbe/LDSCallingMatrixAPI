exports.findCalling = function(unit, data) {
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
