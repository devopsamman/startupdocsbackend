const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth");
const { sendOtpToUserRegister, verifyOtpToUserRegister, userLogin, createUser, updateUser, deleteUser, getAllUsers, getUser, 
    changeUserPassword, changeUserPasswordByAdmin, sendResetPasswordEmail, resetPassword, searchUser, changeUserEmail, verifyOtpForChangeEmail,getExchangeRate,
    getAllUsersForOption } = require("./users-controller");

router.post("/send-otp-to-register-user", sendOtpToUserRegister);

router.post("/verify-otp-to-register-user", verifyOtpToUserRegister);

// Debug middleware for user login route
router.post("/user-login", (req, res, next) => {
    console.log('User login request received:', {
        body: req.body,
        method: req.method,
        path: req.path
    });
    next();
}, userLogin);

router.post("/create-user", createUser);

router.post("/update-user/:id", updateUser);

router.post("/delete-user/:id", deleteUser);

router.get("/get-all-users", getAllUsers);

router.get("/get-all-users-for-options", getAllUsersForOption);

router.get("/get-user", authenticate, getUser);

router.post("/send-link-for-reset-password", sendResetPasswordEmail);

router.post("/reset-password", resetPassword);

router.post("/search-user/:term", searchUser);

router.post("/change-user-password/:id", changeUserPassword);

router.post("/change-user-password-by-admin/:id", changeUserPasswordByAdmin);

router.post("/change-user-email/:id", changeUserEmail);

router.post("/verify-otp-for-change-email", verifyOtpForChangeEmail);

router.get("/get-exchange-rate", getExchangeRate);

module.exports = router;