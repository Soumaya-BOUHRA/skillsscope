import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let memoryServer = null;

const redact = (uri) => uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');

export async function connectDB() {
  const uri = process.env.MONGODB_URI?.trim();
  mongoose.set('strictQuery', true);

  if (uri) {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`[db] MongoDB connected -> ${redact(uri)}`);
  } else {
    console.warn('[db] MONGODB_URI is empty -> starting an in-memory MongoDB (dev only, data is lost on restart).');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryServer.getUri(), { serverSelectionTimeoutMS: 20000 });
    console.log(`[db] In-memory MongoDB started -> ${memoryServer.getUri()}`);
  }

  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message);
  });

  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}

export default connectDB;
