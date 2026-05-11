const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const products = [
  { name: 'Sony WH-1000XM5 Wireless Headphones', description: 'Industry-leading noise cancellation with two processors controlling 8 microphones. 30-hour battery. Ultracomfortable design.', price: 24990, originalPrice: 34990, category: 'electronics', brand: 'Sony', stock: 10, rating: 4.8, numReviews: 12450, thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'], tags: ['headphones', 'wireless', 'sony'], isActive: true },
  { name: 'Apple iPhone 15 Pro Max 256GB', description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip. 48MP camera system with 5x telephoto zoom.', price: 159900, originalPrice: 164900, category: 'electronics', brand: 'Apple', stock: 5, rating: 4.9, numReviews: 8530, thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'], tags: ['iphone', 'apple', 'smartphone'], isActive: true },
  { name: 'Samsung Galaxy S24 Ultra 256GB', description: 'Galaxy AI on the most powerful Galaxy ever. Built-in S Pen, 200MP camera, and titanium frame.', price: 129999, originalPrice: 134999, category: 'electronics', brand: 'Samsung', stock: 15, rating: 4.7, numReviews: 6320, thumbnail: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800'], tags: ['samsung', 'galaxy', 'smartphone'], isActive: true },
  { name: 'Apple MacBook Air M3 15-inch', description: 'Supercharged by M3 chip, with up to 18 hours of battery. Stunning 15.3-inch Liquid Retina display.', price: 134900, originalPrice: 149900, category: 'electronics', brand: 'Apple', stock: 8, rating: 4.9, numReviews: 4210, thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'], tags: ['macbook', 'laptop', 'apple'], isActive: true },
  { name: 'boAt Airdopes 141 Truly Wireless Earbuds', description: '42H playtime, IPX4 water resistance, 8mm drivers. Signature boAt sound with BEAST Mode for gaming.', price: 1299, originalPrice: 2990, category: 'electronics', brand: 'boAt', stock: 200, rating: 4.3, numReviews: 45670, thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'], tags: ['earbuds', 'wireless', 'boat'], isActive: true },
  { name: "Men's Premium Casual Cotton Shirt - Pack of 3", description: 'Premium quality 100% cotton shirts. Breathable and comfortable for daily wear. Available in multiple sizes.', price: 1299, originalPrice: 2499, category: 'fashion', brand: 'FashionHub', stock: 50, rating: 4.2, numReviews: 3210, thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'], tags: ['shirt', 'fashion', 'men'], isActive: true },
  { name: "Women's Floral Anarkali Kurta", description: 'Beautiful floral printed Anarkali kurta. Perfect for festive occasions. Premium quality rayon fabric.', price: 899, originalPrice: 1999, category: 'fashion', brand: 'Myntra', stock: 35, rating: 4.1, numReviews: 2340, thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800', images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'], tags: ['kurta', 'fashion', 'women'], isActive: true },
  { name: 'Minimalist Nordic Coffee Table', description: 'Elegant coffee table with Scandinavian design. Solid walnut wood with white lacquered finish. Assembly required.', price: 8999, originalPrice: 14999, category: 'home', brand: 'HomeStyle', stock: 12, rating: 4.5, numReviews: 892, thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], tags: ['furniture', 'table', 'home'], isActive: true },
  { name: "L'Oréal Paris Revitalift Face Serum 30ml", description: 'Hyaluronic acid serum for intense hydration. Visible anti-wrinkle results in 2 weeks. Dermatologically tested.', price: 649, originalPrice: 999, category: 'beauty', brand: "L'Oreal", stock: 100, rating: 4.4, numReviews: 6780, thumbnail: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800', images: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800'], tags: ['serum', 'skincare', 'loreal'], isActive: true },
  { name: 'OnePlus 12 256GB Flowy Emerald', description: '50MP Hasselblad triple camera, Snapdragon 8 Gen 3, 100W SUPERVOOC charging. 120Hz ProXDR display.', price: 64999, originalPrice: 69999, category: 'electronics', brand: 'OnePlus', stock: 20, rating: 4.6, numReviews: 3450, thumbnail: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800', images: ['https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800'], tags: ['oneplus', 'smartphone', 'android'], isActive: true },
];

const connectDB = async () => {
  const options = { serverSelectionTimeoutMS: 3000 };
  try {
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log('✅ MongoDB Connected (Primary)...'.cyan);
  } catch (err) {
    console.log('⚠️ Primary MongoDB failed, trying local fallback...'.yellow);
    try {
      await mongoose.connect(process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/ShopSphere', options);
      console.log('✅ MongoDB Connected (Fallback)...'.yellow);
    } catch (fallbackErr) {
      console.error(`❌ MongoDB Connection Error: ${fallbackErr.message}`.red);
      process.exit(1);
    }
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Drop existing indexes to avoid slug conflicts
    try { await Product.collection.dropIndex('slug_1'); } catch {}

    await Product.deleteMany();
    console.log('🗑️ Products deleted...'.red);

    // Helper to create/update users
    const upsertUser = async (userData) => {
      let user = await User.findOne({ email: userData.email });
      if (user) {
        user.role = userData.role;
        user.name = userData.name;
        user.password = userData.password; // This will trigger pre-save hook
        await user.save();
        console.log(`🔄 Updated user: ${userData.email} (Role: ${userData.role})`.yellow);
      } else {
        user = await User.create(userData);
        console.log(`✨ Created user: ${userData.email} (Role: ${userData.role})`.green);
      }
      return user;
    };

    const vendor = await upsertUser({ name: 'ShopSphere Seller', email: 'seller@shopsphere.com', password: 'seller123', role: 'vendor' });
    const admin = await upsertUser({ name: 'ShopSphere Admin', email: 'admin@shopsphere.com', password: 'admin123', role: 'admin' });
    const testUser = await upsertUser({ name: 'Test User', email: 'user@shopsphere.com', password: 'user123', role: 'user' });

    // Add unique slug to each product before inserting
    const sampleProducts = products.map((p, i) => ({
      ...p,
      vendor: vendor._id,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + (Date.now() + i),
    }));

    await Product.insertMany(sampleProducts, { ordered: false });
    console.log(`✅ ${sampleProducts.length} Products Seeded!`.green.inverse);
    
    console.log('\n📋 Test Credentials:'.bold);
    console.log('  Admin:  admin@shopsphere.com / admin123'.cyan);
    console.log('  Seller: seller@shopsphere.com / seller123'.cyan);
    console.log('  User:   user@shopsphere.com / user123'.cyan);
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeder Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

seedData();

