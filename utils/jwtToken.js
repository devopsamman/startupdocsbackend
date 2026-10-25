const jwt = require('jsonwebtoken');

// create token and saving that in cookies
const sendToken = (user, statusCode, res, message = "") => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error("FATAL: JWT_SECRET environment variable is not defined!");
    }

    const token = jwt.sign(
        { 
            id: user._id, 
            name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(), 
            email: user.email, 
            phone: user?.phone || "",
            role: user.role || (user.is_super_admin ? 'admin' : 'user')
        }, 
        jwtSecret, 
        {
            expiresIn: process.env.JWT_EXPIRE || '7d',
        }
    );

    // Options for cross-site cookies
    const isProduction = process.env.NODE_ENV === "production";
    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
    };

    // Sanitize user object to never expose password hashes
    const sanitizedUser = user.toObject ? user.toObject() : { ...user };
    delete sanitizedUser.password;
    delete sanitizedUser.__v;

    return res
        .status(statusCode)
        .cookie("token", token, options)
        .json({
            data: { user: sanitizedUser, token },
            status: true,
            message: message ? message : "User logged in successfully",
        });
};

module.exports = sendToken;