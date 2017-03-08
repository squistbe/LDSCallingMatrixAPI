var mongoose = require('mongoose');

var OrgSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	unitNumber: {
		type: String,
		required: true,
		unique: true
	},
	ownerId: {
		type: String
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Org', OrgSchema);
