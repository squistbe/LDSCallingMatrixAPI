var mongoose = require('mongoose');

var MemberSchema = new mongoose.Schema({
	name: {
		first: String,
		last: String
	},
	phone: String,
	email: String,
	unitNumber: String
});

module.exports = mongoose.model('Member', MemberSchema);
