var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//Schema
var User = new Schema({
		    user:String,
		    pass:String
		}, { versionKey: false });
var Comments = new Schema({
       name: String
      , body: String
      , created: Date
});

var Author = new Schema({
      username: String
      });

var Tags = new Schema({
      tag: String
      });

var Post = new Schema({
    subject: String
  , slug: String
  , body: String
  , tags: [String]
  , created: Date
  , modified: Date
  , state: String
  , author: {username: String}
  , comments: [Comments]
}, { versionKey: false });
		
exports.userModel = function(){
		return mongoose.model('User', User);
}

exports.postModel = function(){
		return mongoose.model('Post', Post);
}

