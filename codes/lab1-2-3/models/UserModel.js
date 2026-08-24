var mongoose = require('mongoose');
var UserSchema = mongoose.Schema(
   {
      username: {
         type: String,
         unique: true,
         required: true
      },
      password: {
         type: String,
         required: true
      },
      role: {
         type: String,
         enum: ['user', 'admin'],
         default: 'user',
         required: true
      }
   }
);
var UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;

