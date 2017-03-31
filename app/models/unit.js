var mongoose = require('mongoose'),
		OrgSchema = require('./org').schema,
		Schema = mongoose.Schema;

var UnitSchema = new Schema({
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
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	orgs: [OrgSchema]
}, {
	timestamps: true
});

module.exports = mongoose.model('Unit', UnitSchema);
