require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const app = express();

// built-in middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname + "/uploads")));

console.log({ filePath: path.join(__dirname + "/uploads") });

//import routes
const connectDatabase = require("./db/database");

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

//connect db
connectDatabase();

//create server//
const server = app.listen(process.env.PORT, () => {
  console.log("Server is running on port", process.env.PORT);
});

module.exports = app;
