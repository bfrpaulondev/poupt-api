const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function fixJars() {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await User.updateMany(
    { 'jarPercentages.give': 5 },
    { $set: { 'jarPercentages.give': 10 } }
  );
  console.log(`Updated ${result.modifiedCount} users`);
  process.exit(0);
}
fixJars().catch(console.error);
