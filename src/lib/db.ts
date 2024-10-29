import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: boolean;
};

const connection: ConnectionObject = {};

// Connect to MongoDB
async function dbConnect(): Promise<void> {
  // Check if already connected
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  // Check if MongoDB URI is provided
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not defined.");
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);

    connection.isConnected = db.connections[0].readyState === 1;

    console.log("DB connected successfully");
  } catch (error) {
    console.error("Database connection failed", error);
    throw new Error("Database connection failed");
  }
}

export default dbConnect;
