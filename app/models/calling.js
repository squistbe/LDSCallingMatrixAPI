var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    AutoIncrement = require('mongoose-sequence');

var CallingSchema = new Schema({
  name: String,
  className: String,
  sortIndex: Number,
  member: {
    type: Schema.Types.ObjectId,
    ref: 'Member'
  },
  status: {
    type: Schema.Types.ObjectId,
    ref: 'CallingStatus'
  }
});

module.exports = mongoose.model('Calling', CallingSchema);
CallingSchema.plugin(AutoIncrement, {inc_field: 'sortIndex'});
