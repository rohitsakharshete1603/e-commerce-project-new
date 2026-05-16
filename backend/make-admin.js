/**
 * make-admin.js
 * Run: node make-admin.js your@email.com
 * Makes the user with that email an admin
 */
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.log('Usage: node make-admin.js your@email.com');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email });
  if (!user) {
    console.log('User not found:', email);
    process.exit(1);
  }
  user.isAdmin = true;
  await user.save();
  console.log('✅  ' + user.name + ' (' + email + ') is now an Admin!');
  await mongoose.disconnect();
  process.exit(0);
}

makeAdmin().catch(err => { console.error(err.message); process.exit(1); });