const jwt = require('jsonwebtoken');
const User = require('../src/users/users-model');
const ErrorHandler = require('../utils/ErrorHandler');
const SuperAdmin = require('../src/super-admin/super-admin-model');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        let token = null;

        if (authHeader) {
            if (authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            } else {
                token = authHeader.trim();
            }
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return next(new ErrorHandler("Please login to continue", 401));
        }

        if (!process.env.JWT_SECRET) {
            console.error("FATAL: JWT_SECRET environment variable is missing!");
            return next(new ErrorHandler("Internal server authentication error", 500));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            return next(new ErrorHandler("Invalid authentication token", 401));
        }

        const user = await User.findById(decoded.id);
        const superAdmin = !user ? await SuperAdmin.findById(decoded.id) : null;

        if (!user && !superAdmin) {
            return next(new ErrorHandler("User not found or authorization revoked", 401));
        }

        req.user = user || superAdmin;
        req.userRole = superAdmin ? 'admin' : (user.role || 'user');

        return next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ status: false, message: "Token expired. Please login again." });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ status: false, message: "Invalid token. Authorization failed." });
        }
        return res.status(401).json({ status: false, message: "User Not Authorized" });
    }
};

module.exports = authenticate;