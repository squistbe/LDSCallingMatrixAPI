var mongoose = require('mongoose'),
    CallingSchema = require('./calling').schema;

var OrgSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
  sortIndex: {
    type: Number
  },
  callings: [CallingSchema]
});

module.exports = mongoose.model('Org', OrgSchema);
