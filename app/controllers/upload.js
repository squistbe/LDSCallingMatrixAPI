var Unit = require('../models/unit'),
    Member = require('../models/member'),
    fs = require('fs'),
    csv = require("fast-csv");

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return "";
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

exports.addMembers = function(req, res, next) {
  var stream = fs.createReadStream(req.file.path),
      output = [];

  csv.fromStream(stream)
    .on('data', function(data) {
      output.push(data)
    })
    .on('end', function() {
      var headers = output.shift(),
          newMembers = [];

      // output.forEach(function(record) {
      //   var household = {
      //     children: []
      //   };
      //   headers.forEach(function(header, i) {
      //     var item = record[i],
      //         key = camelize(header),
      //         name = item && item[i] ? item.split(', ') : '';
      //
      //     switch (header) {
      //       case 'Family Name':
      //       case 'Couple Name':
      //       case 'Family Phone':
      //       case 'Family Email':
      //       case 'Family Address':
      //       case 'Head Of House Phone':
      //       case 'Head Of House Email':
      //       case 'Spouse Phone':
      //       case 'Spouse Email':
      //         household[key] = item;
      //         break;
      //       case 'Head Of House Name':
      //       case 'Spouse Name':
      //         if(name) {
      //           household[key] = {
      //             first: name[1],
      //             last: name[0]
      //           };
      //         }
      //         break;
      //       case 'Child Name':
      //         if(name) {
      //           household.children.push({
      //             name: {
      //               first: name[1],
      //               last: name[0]
      //             },
      //             phone: item[i + 1],
      //             email: item[i + 2]
      //           });
      //         }
      //         break;
      //     }
      //
      //   })
      //   newMembers.push(household);
      // });

      //newMembers.sort(function(a, b) {return (a.name.last > b.name.last) ? 1 : ((b.name.last > a.name.last) ? -1 : 0);})

      Unit.findOne({unitNumber: req.user.unitNumber}, function(err, unit) {
        if(err) return next(err);

        if(unit) {
          headers.forEach(function(header, i) {
            output.forEach(function(record) {
              if(header === 'Head Of House Name' || header === 'Spouse Name' || header === 'Child Name') {
                var name = record[i];

                if(name) {
                  var splitName = name.split(', '),
                      newMember = new Member({
                        name: {
                          first: splitName[1],
                          last: splitName[0]
                        },
                        phone: record[i + 1],
                        email: record[i + 2],
                        unitNumber: req.user.unitNumber
                      });

                  newMembers.push(newMember);
                }
              }
            });
          });
          Member.collection.insert(newMembers, function(err, members) {
          //unit.members = newMembers;
          //unit.save(function(err, found) {
      			//if(err) return next(err);

            fs.unlink(req.file.path);
            res.status(200).json(members.ops);
          });
          //});
        }
      });
    });
}
