var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;
var UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		trim: true,
		lowercase: true,
		unique: true,
		required: true,
		match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
	},
	password: {
		type: String,
		required: true
	},
	role: {
		type: String,
		enum: ['reader', 'creator', 'editor'],
		default: 'reader'
	},
	unitNumber: String

}, {
	timestamps: true
});

UserSchema.pre('save', function(next) {
	var user = this;
	var SALT_FACTOR = 5;

	if(!user.isModified('password')) return next();

	bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
		if(err) return next(err);

		bcrypt.hash(user.password, salt, null, function(err, hash) {

			if(err) return next(err);

			user.password = hash;
			next();
		});
	});
});

UserSchema.methods.comparePassword = function(passwordAttempt, cb) {
	bcrypt.compare(passwordAttempt, this.password, function(err, isMatch) {
		if(err) return cb(err);
		else cb(null, isMatch);
	});
}

module.exports = mongoose.model('User', UserSchema);
