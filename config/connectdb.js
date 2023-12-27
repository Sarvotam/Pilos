import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
    try {
        const DB_OPTIONS = {
            dbName: "node_database",
        };
        await mongoose.connect(DATABASE_URL, DB_OPTIONS);
        console.log('connected successfully...')
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
};

export default connectDB;
