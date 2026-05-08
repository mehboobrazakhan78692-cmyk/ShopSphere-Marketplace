const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Delete existing test users if they exist
    await User.deleteMany({ email: { $in: ['admin@test.com', 'vendor@test.com', 'customer@test.com'] } });

    const users = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        isVerified: true
      },
      {
        name: 'Vendor User',
        email: 'vendor@test.com',
        password: 'password123',
        role: 'vendor',
        isVerified: true
      },
      {
        name: 'Customer User',
        email: 'customer@test.com',
        password: 'password123',
        role: 'customer',
        isVerified: true
      }
    ];

    await User.create(users);
    console.log('Test users seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
