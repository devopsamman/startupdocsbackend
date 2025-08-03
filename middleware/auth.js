const jwt = require('jsonwebtoken');
const User = require('../src/users/users-model');
const ErrorHandler = require('../utils/ErrorHandler');
const SuperAdmin = require('../src/super-admin/super-admin-model');

const authenticate = async (req, res, next) => {
    try {
        let token = req.header("Authorization");

        token = token.split(' ')[1]

        if (!token) {
            next(new ErrorHandler("Please login to continue", 400));
        }

        // Debug log for JWT secret in auth middleware
        console.log("JWT_SECRET value in auth middleware:", process.env.JWT_SECRET);
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            next(new ErrorHandler("Please login to continue", 400));
        }

        const user = await User.findOne({ _id: decoded.id });

        const superAdmin = await SuperAdmin.findOne({ _id: decoded.id });

        if (user) {
            req.user = user;
        }

        if (superAdmin) {
            req.user = superAdmin;
        }

        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ status: false, message: 'User Not Authorized' })
    }
}

module.exports = authenticate;