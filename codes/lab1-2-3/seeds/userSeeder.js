var bcrypt = require('bcryptjs');
var UserModel = require('../models/UserModel');

const DEMO_PASSWORD = '123456';
const SALT_ROUNDS = 8;

async function seedDemoUsers() {
   const password = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);
   const demoUsers = [
      { username: 'admin', role: 'admin' },
      { username: 'user', role: 'user' }
   ];

   await Promise.all(demoUsers.map((demoUser) =>
      UserModel.updateOne(
         { username: demoUser.username },
         { $set: { ...demoUser, password } },
         { upsert: true }
      )
   ));

   console.log('Demo users are ready: admin / user (password: 123456)');
}

module.exports = seedDemoUsers;
