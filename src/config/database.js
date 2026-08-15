const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS to fix Windows SRV record resolution failures (ECONNREFUSED on _mongodb._tcp.*)
dns.setServers(['8.8.8.8', '1.1.1.1']);


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            family: 4,                    // Force IPv4 DNS — fixes Windows SRV lookup issues
            serverSelectionTimeoutMS: 10000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Automatically clean up any legacy broken Cloudinary profile picture URLs
        try {
            const User = require('../models/User');
            const brokenUsers = await User.find({ 'profilePicture.url': { $regex: 'dbs85dcb1' } });
            if (brokenUsers.length > 0) {
                console.log(`🧹 Found ${brokenUsers.length} users with old Cloudinary profile pictures. Replacing with working avatars...`);
                for (const u of brokenUsers) {
                    const seed = encodeURIComponent(u.displayName || u._id.toString());
                    u.profilePicture = {
                        url: `https://api.dicebear.com/9.x/notionists/png?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
                        publicId: 'default-ai'
                    };
                    await u.save();
                }
                console.log('✅ All legacy profile pictures updated to fresh working avatars!');
            }
        } catch (e) {
            console.error('Profile picture cleanup warning:', e.message);
        }

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
