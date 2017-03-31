var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CallingSchema = new Schema({
  name: String,
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
