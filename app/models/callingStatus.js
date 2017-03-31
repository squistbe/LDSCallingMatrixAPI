var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var CallingStatusSchema = new Schema({
	name: String,
  type: String,
	value: String,
	label: String,
	checked: Boolean,
	description: String,
	sortIndex: Number,
	id: String
});

module.exports = mongoose.model('CallingStatus', CallingStatusSchema);
