const mongoose = require("mongoose");

const connectDatabase = async () => {
  if (!process.env.DB_URL) {
    console.error("FATAL: DB_URL environment variable is not defined!");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.DB_URL, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB initial connection error:", err.message);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection disconnected. Mongoose will attempt to reconnect.");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB connection re-established.");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection runtime error:", err.message);
});

module.exports = connectDatabase;

