var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
	username: String,
	email :String,
	password: String,
	isAdmin: {type: Boolean, default: false}
})
// var User = mongoose.model("User", userSchema);
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);