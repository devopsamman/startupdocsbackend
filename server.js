require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const connectDatabase = require("./db/database");

const app = express();

// Ensure required upload directories exist on boot
const uploadDirs = [
  path.join(__dirname, "uploads"),
  path.join(__dirname, "uploads", "passports"),
  path.join(__dirname, "uploads", "documents")
];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configure CORS for startupdocs.in, localhost, and env-defined origins
const allowedOrigins = [
  'https://startupdocs.in',
  'https://www.startupdocs.in',
  'http://localhost:3000',
  'http://localhost:5173'
];

if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach((origin) => {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Global Rate Limiting for API protection
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: false, message: "Too many requests from this IP, please try again later." }
});
app.use("/api", apiLimiter);

// Request body parsing
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Static uploads serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Render Liveness/Readiness Health Check Endpoint
app.get("/health", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? "healthy" : "unhealthy",
    database: isDbConnected ? "connected" : "disconnected",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Import API routes
const userRoutes = require("./src/users/users-routes");
const companyRoutes = require("./src/company/company-routes");
const documentRoutes = require("./src/document/document-routes");
const couponRoutes = require("./src/coupon/coupon-routes");
const servicePurchasedRoutes = require("./src/service-purchased/service-purchased-routes");
const userTransactionsRoutes = require("./src/user-transactions/user-transactions-routes");
const superAdminRoutes = require("./src/super-admin/super-admin-routes");
const testimonialRoutes = require("./src/testimonials/testimonials-routes");
const newsletterRoutes = require("./src/newsletter/newsletter-routes");
const payRoutes = require("./src/payu/payu-routes");
const passportRoutes = require("./src/passport/passport-routes");

app.use("/api/user", userRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/passport", passportRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/service-purchased", servicePurchasedRoutes);
app.use("/api/user-transaction", userTransactionsRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/testimonial", testimonialRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/payu", payRoutes);

// Error middleware
const errorMiddleware = require("./middleware/error");
app.use(errorMiddleware);

// Server startup & Port binding
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  const server = app.listen(PORT, () => {
    console.log(`StartupDocs Backend running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please terminate conflicting process or use a different port.`);
    } else {
      console.error('Server error:', err);
    }
  });

  // Graceful shutdown for zero-downtime Render deploys
  const gracefulShutdown = (signal) => {
    console.log(`${signal} received. Closing HTTP server and database connections...`);
    server.close(async () => {
      try {
        await mongoose.connection.close(false);
        console.log("Database connection closed cleanly. Process exiting.");
      } catch (err) {
        console.error("Error closing database connection:", err);
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer();

// Global unhandled crash guards
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

module.exports = app;

