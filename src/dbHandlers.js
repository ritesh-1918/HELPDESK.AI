const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/rbac', { useNewUrlParser: true, useUnifiedTopology: true });

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Agent', 'Employee'], required: true }
});

// User model
const User = mongoose.model('User', userSchema);

// Function to create a new user
async function createUser(username, password, role) {
  const hashedPassword = await bcrypt.hash(password, 8);
  const user = new User({ username, password: hashedPassword, role });
  await user.save();
  return user;
}

// Function to authenticate a user
async function authenticateUser(username, password) {
  const user = await User.findOne({ username });
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  return user;
}

// Example usage
(async () => {
  await createUser('admin', 'password123', 'Admin');
  await createUser('agent', 'password123', 'Agent');
  await createUser('employee', 'password123', 'Employee');

  const user = await authenticateUser('admin', 'password123');
  if (user) {
    console.log(`Authenticated as ${user.role}`);
  } else {
    console.log('Authentication failed');
  }
})();