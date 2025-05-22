import mongoose from 'mongoose';

let connected = false;

export const connectDB = async () => {
  mongoose.set('strictQuery', true);
  if (connected) {
    console.log('MongoDB is already connected');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    connected = true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

