const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const ShortUniqueId = require("short-unique-id");
const User = require("./users-model");
const Otp = require("../otp/otp-model");
const sendToken = require("../../utils/jwtToken");
const { sendResetPasswordUser, sendOtpForUserSignup, newAccountCreated, orderReceived } = require("../../utils/mail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

async function convertUSDtoINR() {
    try {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        const inrRate = response.data.rates.INR;
        return inrRate;
    } catch (error) {
        console.log("Error converting USD to INR: ", error);
        throw new ErrorHandler("Currency conversion failed", 500);
    }
}

exports.sendOtpToUserRegister = catchAsyncErrors(async (req, res, next) => {
    try {
        const { email } = req.body;

        const emailExist = await User.findOne({ email: email });

        if (emailExist) {
            return res.status(400).json({ status: false, message: "Email already exist" })
        }

        const uniqueNumId = new ShortUniqueId({ length: 4, dictionary: "number" });
        const currentUniqueId = uniqueNumId.rnd();

        await Otp.create({ email: email, otp: currentUniqueId, otp_expiry: new Date(Date.now() + 20 * 60 * 1000) });

        await sendOtpForUserSignup({ email: email, otp: currentUniqueId });

        sendResponse(res, 200, "OTP Sent Successfully", currentUniqueId);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.verifyOtpToUserRegister = catchAsyncErrors(async (req, res, next) => {
    try {
        const { email, otp, password } = req.body;

        const otpData = await Otp.findOne({ email: email, otp: otp });

        if (!otpData) {
            return res.status(400).json({ status: false, error: "Invalid OTP" })
        }

        if (otpData.otp_expiry < Date.now()) {
            await Otp.deleteMany({ email: email });
            return res.status(400).json({ status: false, error: "OTP Expired" })
        }

        await Otp.deleteMany({ email: email });

        const hash = await bcrypt.hash(password, 10);
        req.body.password = hash;

        const uniqueNumId = new ShortUniqueId({ length: 5, dictionary: "number" });
        const currentUniqueId = uniqueNumId.rnd();

        const user = await User.create({ ...req.body, user_id: "USER" + currentUniqueId });

        console.log('user', user)

        if (user) {
            const mail_data = await newAccountCreated({ email: user?.email, first_name: user?.first_name, last_name: user?.last_name });

            console.log('mail_data', mail_data)
        }

        sendToken(user, 200, res, "User created Successfully");
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));

    }
})

exports.userLogin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Log login attempt
        console.log('Login attempt for email:', email);

        if (!email || !password) {
            console.log('Login failed: Missing email or password');
            return res.status(400).json({
                success: false,
                message: "Please enter both email and password"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            console.log('Login failed: User not found for email:', email);
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        // Log password match result (but not the actual password)
        console.log('Password match result for user:', { email, matched: isMatch });


        if (!isMatch) {
            console.log('Login failed: Invalid password for email:', email);
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (user?.is_active === false) {
            console.log('Login failed: Inactive user account for email:', email);
            return res.status(400).json({
                success: false,
                message: "Your account is currently inactive. Please contact support."
            });
        }

        // Add redirect URL based on user type
        const redirectUrl = !user.is_user ? '/admin/dashboard' : '/user/dashboard';
        
        // Log successful login attempt
        console.log('Login successful for user:', {
            email: user.email,
            role: user.role,
            redirectUrl
        });

        // Send response with token and redirect URL
        return res.status(200).json({
            success: true,
            data: {
                user,
                token: (() => {
                    // Debug log for JWT secret
                    console.log("JWT Secret is:", process.env.JWT_SECRET);
                    return jwt.sign(
                    { 
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.is_user ? 'user' : 'admin',
                        phone: user?.phone || "" 
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRE }
                )})(),
                redirectUrl
            },
            message: "User Login Successfully"
        });
    } catch (error) {
        console.error('Login Error:', error.message);
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.sendOtpToUserLogin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { phone } = req.body;

        const phoneExist = await User.findOne({ phone: phone });

        if (!phoneExist) {
            return res.status(400).json({ status: false, message: "Phone number not exist" })
        }

        if (!phoneExist.phone_verified) {
            return res.status(400).json({ status: false, message: "Phone number not verified" })
        }

        const uniqueNumId = new ShortUniqueId({ length: 4, dictionary: "number" });
        const currentUniqueId = uniqueNumId.rnd();

        await Otp.create({ email: phone, otp: currentUniqueId, otp_expiry: new Date(Date.now() + 20 * 60 * 1000) });

        sendResponse(res, 200, "OTP Sent Successfully", currentUniqueId);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.verifyOtpToUserLogin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { phone, otp } = req.body;

        const otpData = await Otp.findOne({ email: phone, otp: otp });

        if (!otpData) {
            return next(new ErrorHandler("Invalid OTP", 400));
        }

        if (otpData.otp_expiry < Date.now()) {
            return next(new ErrorHandler("OTP Expired", 400));
        }

        const user = await User.findOne({ phone: phone });

        sendToken(user, 200, res, "User Logged In Successfully");
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));

    }
})

exports.createUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const { password } = req.body;

        const hash = await bcrypt.hash(password, 10);
        req.body.password = hash;

        console.log('password', password)

        console.log('hash password', req.body.password)


        const uniqueNumId = new ShortUniqueId({ length: 5, dictionary: "number" });
        const currentUniqueId = uniqueNumId.rnd();

        const newUser = await User.create({ ...req.body, user_id: "USER" + currentUniqueId });

        console.log('newUser', newUser)

        if (newUser) {
            try {
                const mail_data = await newAccountCreated({ email: newUser?.email, first_name: newUser?.first_name, last_name: newUser?.last_name });

                // console.log('mail_data', mail_data)
            }
            catch (error) {
                console.log('error in sending mail', error)
            }
        }

        console.log('successfully user created')

        sendResponse(res, 200, "User Created Successfully", newUser);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.getUser = catchAsyncErrors(async (req, res, next) => {
    try {
        if (req.user) {
            sendResponse(res, 200, "User Fetched Successfully", req.user);
        } else {
            return next(new ErrorHandler("User Not Found", 404));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    try {

        const userId = req.params.id;

        const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedUser) {
            return next(new ErrorHandler("User Not Found", 404));
        }

        sendResponse(res, 200, "User Updated Successfully", updatedUser);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const userId = req.params.id;

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return next(new ErrorHandler("User Not Found", 404));
        }

        sendResponse(res, 200, "User Deleted Successfully", deletedUser);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    try {
        const { pageNumber } = req.query;
        const totalUsers = await User.countDocuments();

        const users = await User.find({})
            .sort({ created_at: -1 })
            .skip((pageNumber - 1) * 15)
            .limit(15);

        sendResponse(res, 200, "User Fetched Successfully", {
            totalUsers,
            totalPages: Math.ceil(totalUsers / 15),
            currentPage: parseInt(pageNumber, 10),
            users
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})



exports.getAllUsersForOption = catchAsyncErrors(async (req, res, next) => {
    try {
        const users = await User.find({})
            .sort({ created_at: -1 })

        sendResponse(res, 200, "User Fetched Successfully", users);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.sendOtpVerifyUserPhone = catchAsyncErrors(async (req, res, next) => {
    try {
        const { phone } = req.body;

        const phoneExist = await User.findOne({ phone });

        if (phoneExist) {
            return res.status(401).json({ error: "Phone Number Already Exists" });
        }

        const uniqueNumId = new ShortUniqueId({ length: 4, dictionary: "number" });
        const currentUniqueId = uniqueNumId.rnd();

        const otp = await Otp.create({ email: phone, otp: currentUniqueId, otp_expiry: Date.now() + 20 * 60 * 1000 });

        sendResponse(res, 200, "OTP Sent Successfully", currentUniqueId);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.verifyOtpToUserPhone = catchAsyncErrors(async (req, res, next) => {
    try {
        const { otp, phone } = req.body;

        const otpExist = await Otp.findOne({ otp, email: phone });

        if (!otpExist) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        if (otpExist?.otp_expiry < Date.now()) {
            await Otp.deleteMany({ email: phone });
            return res.status(400).json({ error: "OTP Expired" });
        }

        await Otp.deleteMany({ email: phone });

        sendResponse(res, 200, "OTP Verified Successfully");

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.sendResetPasswordEmail = catchAsyncErrors(async (req, res, next) => {
    try {

        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res?.status(400).json({ status: false, message: "Email not exist" });
        }

        // Debug log for JWT secret
        console.log("JWT_SECRET value:", process.env.JWT_SECRET);
        
        const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        });

        let mail_data = {
            email: email,
            token: token,
            first_name: user?.first_name,
            last_name: user?.last_name
        };

        await sendResetPasswordUser(mail_data);

        sendResponse(res, 200, "Reset password mail sent successfully", []);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});


exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    try {
        const { token, new_password } = req.body;

        if (!token) {
            next(new ErrorHandler("No token found", 400));
        }
        // Debug log for JWT secret
        console.log("JWT_SECRET value:", process.env.JWT_SECRET);
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            next(new ErrorHandler("Token is not valid", 400));
        }

        const user = await User.findById(decoded.id);

        // Update the password
        const hash = await bcrypt.hash(new_password, 10);
        user.password = hash;

        // Save the updated sub-admin (this will trigger the pre-save hook to hash the new password)
        await user.save();

        sendResponse(res, 200, "user password changed successfully", []);
        // return res.status(201).json(user);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});




exports.searchUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const { term } = req.params;

        const pageNumber = req.query.pageNumber;

        const query = {
            $or: [
                { first_name: { $regex: term, $options: "i" } },
                { last_name: { $regex: term, $options: "i" } },
                { email: { $regex: term, $options: "i" } },
                { country: { $regex: term, $options: "i" } },
                { phone: { $regex: term, $options: "i" } },
                { user_id: { $regex: term, $options: "i" } },
            ],
        };

        const totalUsers = await User.countDocuments(query);

        const users = await User.find(query)
            .sort({ created_at: -1 })
            .skip((pageNumber - 1) * 15)
            .limit(15);

        sendResponse(res, 200, "All Users Fetched Successfully", {
            totalUsers,
            totalPages: Math.ceil(totalUsers / 15),
            currentPage: parseInt(pageNumber, 10),
            users,
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.changeUserPassword = catchAsyncErrors(async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return next(new ErrorHandler("User not found!", 400));
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.password)

        if (passwordMatch) {
            const hash = await bcrypt.hash(newPassword, 10);
            const userUpdated = await User.findByIdAndUpdate(userId, { password: hash }, {
                new: true,
                runValidators: true,
            });
            sendResponse(res, 200, "User Password Changed Successfully", userUpdated);
        }
        else {
            return res.status(500).json({ status: false, message: "Current Password Incorrect" });
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.changeUserPasswordByAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { newPassword } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return next(new ErrorHandler("User not found!", 400));
        }

        const hash = await bcrypt.hash(newPassword, 10);
        const userUpdated = await User.findByIdAndUpdate(userId, { password: hash }, {
            new: true,
            runValidators: true,
        });
        sendResponse(res, 200, "User Password Changed Successfully", userUpdated);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.changeUserEmail = catchAsyncErrors(async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { newEmail } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return next(new ErrorHandler("User not found!", 400));
        }

        const uniqueNumId = new ShortUniqueId({ length: 4, dictionary: "number" });
        const currentUniqueId = uniqueNumId.rnd();

        const otp = await Otp.create({ email: newEmail, otp: currentUniqueId, otp_expiry: Date.now() + 20 * 60 * 1000 });

        const mail_data = {
            email: newEmail,
            otp: currentUniqueId,
        };

        await sendOtpForUserSignup(mail_data);

        sendResponse(res, 200, "OTP Sent Successfully", {});

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.verifyOtpForChangeEmail = catchAsyncErrors(async (req, res, next) => {
    try {
        const { new_email, otp, user_id } = req.body;

        const otpData = await Otp.findOne({ email: new_email, otp: otp });

        if (!otpData) {
            return res.status(400).json({ status: false, error: "Invalid OTP" })
        }

        if (otpData?.otp_expiry < Date.now()) {
            return res.status(400).json({ status: false, error: "OTP Expired" })
        }

        await Otp.deleteMany({ new_email });

        const user = await User.findByIdAndUpdate(user_id, { email: new_email }, {
            new: true,
            runValidators: true,
        });

        sendResponse(res, 200, "Email Changed Successfully", user);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getExchangeRate = catchAsyncErrors(async (req, res, next) => {
    try {
        const exchangeRate = await convertUSDtoINR();
        sendResponse(res, 200, "Exchange Rate Fetched Successfully", exchangeRate);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});