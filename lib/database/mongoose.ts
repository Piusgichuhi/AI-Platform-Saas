import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Define a custom type for the global object that includes a mongoose property
declare global {
  // This extends the NodeJS global object to include our custom mongoose cache.
  var mongoose: MongooseConnection | undefined;
}

let cached: MongooseConnection = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export const connectToDatabase = async (): Promise<Mongoose> => {
  if (cached.conn) return cached.conn;

  // Error if MONGODB_URL is not defined
  if (!MONGODB_URL) throw new Error("MONGODB_URL is not defined");

  // Set the promise to the mongoose.connect if it's not already set
  cached.promise =
    cached.promise || mongoose.connect(MONGODB_URL, { dbName: "AI Platform App", bufferCommands: false });

  // Await the promise and set the connection
  cached.conn = await cached.promise;

  return cached.conn;
};
