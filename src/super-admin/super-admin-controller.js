const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const SuperAdmin = require("./super-admin-model");
const bcrypt = require("bcryptjs");
const sendToken = require("../../utils/jwtToken");
const ShortUniqueId = require("short-unique-id");
const { sendEmailUpdateOtp, sendResetPasswordSuperAdmin, sendContactMessage, sendEinMail } = require("../../utils/mail");
const jwt = require("jsonwebtoken");
const Documents = require("../document/document-model");
const Company = require("../company/company-model");
const User = require("../users/users-model");
const Testimonial = require("../testimonials/testimonials-model");
const UserTransaction = require("../user-transactions/user-transactions-model");

exports.createSuperAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const hash = await bcrypt.hash(password, 10);

        const currentSuperAdmin = await SuperAdmin.findOne({ email });

        if (currentSuperAdmin) {
            return next(new ErrorHandler("Admin email already exist.", 500));
        }

        const newSuperAdmin = await SuperAdmin.create({ ...req.body, password: hash });

        sendResponse(res, 200, "Admin created successfully", newSuperAdmin);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});


exports.superAdminLogin = catchAsyncErrors(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const superAdmin = await SuperAdmin.findOne({ email });

        if (!superAdmin) {
            return res.status(500).json({ status: false, message: "Admin does not exist" })
        }

        const passwordMatch = await bcrypt.compare(password, superAdmin.password)

        if (passwordMatch) {
            sendToken(superAdmin, 200, res, "Admin Login successfully");
        }
        else {
            sendResponse(res, 401, "Password Incorrect", {});
        }
    } catch (error) {
        res.status(500).json({ status: false, data: error.message })
    }
});


exports.updateSuperAdminByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const superAdminID = req.params.id;

        const superAdmin = await SuperAdmin.findByIdAndUpdate(superAdminID, req.body, {
            new: true,
            runValidators: true,
        });

        if (!superAdmin) {
            return next(new ErrorHandler("Admin not found!", 400));
        }

        sendResponse(res, 200, "Admin Updated Successfully", superAdmin);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.changePassword = catchAsyncErrors(async (req, res, next) => {
    try {
        const superAdminID = req.params.id;
        const { currentPassword, newPassword } = req.body;

        const superAdmin = await SuperAdmin.findById(superAdminID);

        if (!superAdmin) {
            return next(new ErrorHandler("Admin not found!", 400));
        }

        const passwordMatch = await bcrypt.compare(currentPassword, superAdmin.password)

        if (passwordMatch) {
            const hash = await bcrypt.hash(newPassword, 10);
            const superAdminUpdated = await SuperAdmin.findByIdAndUpdate(superAdminID, { password: hash }, {
                new: true,
                runValidators: true,
            });
            sendResponse(res, 200, "Admin Password Changed Successfully", superAdminUpdated);
        }
        else {
            return res.status(500).json({ status: false, message: "Current Password Incorrect" });
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.sendResetPasswordEmail = catchAsyncErrors(async (req, res, next) => {
    try {

        const { email } = req.body;
        const superAdmin = await SuperAdmin.findOne({ email });

        if (!superAdmin) {
            return next(new ErrorHandler("Admin not found", 404));
        }

        const token = superAdmin.getJwtToken();

        let mail_data = {
            email: email,
            token: token,
        };

        await sendResetPasswordSuperAdmin(mail_data);
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            next(new ErrorHandler("Token is not valid", 400));
        }

        const superAdmin = await SuperAdmin.findById(decoded.id);

        // Update the password
        const hash = await bcrypt.hash(new_password, 10);
        superAdmin.password = hash;

        // Save the updated sub-admin (this will trigger the pre-save hook to hash the new password)
        await superAdmin.save();

        sendResponse(res, 200, "Admin password changed successfully", []);
        // return res.status(201).json(user);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

const getMonthRange = (monthOffset) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 1);
    return { start, end };
};


exports.getDashboardStats = catchAsyncErrors(async (req, res, next) => {
    try {
        const companies = await Company.countDocuments({});
        const documents = await Documents.countDocuments({});
        const users = await User.countDocuments({});
        const testimonials = await Testimonial.countDocuments({});

        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthRange = getMonthRange(1);
        const lastSevenMonthsRange = getMonthRange(7);

        // Aggregation pipeline for calculating sales
        const calculateSales = async (start, end) => {
            const sales = await UserTransaction.aggregate([
                {
                    $match: {
                        created_at: {
                            $gte: start,
                            $lt: end,
                        },
                    },
                },
                /// add something
                {
                    $addFields: {
                        amountDouble: {
                            $convert: {
                                input: "$amount",
                                to: "double",
                                onError: 0, // Default to 0 if conversion fails
                                onNull: 0,  // Default to 0 if the field is null
                            },
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalSales: { $sum: "$amountDouble" },
                        count: { $sum: 1 },
                    },
                },
            ]);
            return sales.length ? sales[0]?.totalSales : 0;
        };


        const lastSevenMonthsSales = [];
        for (let i = 6; i >= 0; i--) {
            const { start, end } = getMonthRange(i);
            const sales = await calculateSales(start, end);
            lastSevenMonthsSales.push(sales);
        }


        const currentMonthSales = await calculateSales(currentMonthStart, now);
        const lastMonthSales = await calculateSales(lastMonthRange.start, lastMonthRange.end);

        const currentMonthCreatedCompanies = await Company.countDocuments({
            created_at: {
                $gte: currentMonthStart,
                $lte: now
            }
        });

        const lastMonthCreatedCompanies = await Company.countDocuments({
            created_at: {
                $gte: lastMonthRange.start,
                $lte: lastMonthRange.end
            }
        });

        const currentMonthCreatedUsers = await User.countDocuments({
            created_at: {
                $gte: currentMonthStart,
                $lte: now
            }
        });

        const lastMonthCreatedUsers = await User.countDocuments({
            created_at: {
                $gte: lastMonthRange.start,
                $lte: lastMonthRange.end
            }
        });

        const currentMonthCreatedDocuments = await Documents.countDocuments({
            created_at: {
                $gte: currentMonthStart,
                $lte: now
            }
        });

        const lastMonthCreatedDocuments = await Documents.countDocuments({
            created_at: {
                $gte: lastMonthRange.start,
                $lte: lastMonthRange.end
            }
        });

        const lastFiveCompanies = await Company.find({})
            .sort({ created_at: -1 })
            .limit(5)
            .select('company_name designator');

        sendResponse(res, 200, "Company Stats Fetched Successfully", {
            companies,
            documents,
            users,
            testimonials,
            currentMonth: {
                sales: currentMonthSales,
                companies: currentMonthCreatedCompanies,
                documents: currentMonthCreatedDocuments,
                users: currentMonthCreatedUsers
            },
            lastMonth: {
                sales: lastMonthSales,
                companies: lastMonthCreatedCompanies,
                documents: lastMonthCreatedDocuments,
                users: lastMonthCreatedUsers
            },
            lastSevenMonths: lastSevenMonthsSales,
            lastFiveCompanies
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});




exports.sendContactMessage = catchAsyncErrors(async (req, res, next) => {
    try {
        const { email, message, first_name, last_name, phone } = req.body;

        await sendContactMessage({
            email: email,
            first_name: first_name,
            last_name: last_name,
            phone: phone,
            message: message
        });

        sendResponse(res, 200, "Message sent successfully", {});
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});


exports.sendEinProceededMail = catchAsyncErrors(async (req, res, next) => {
    try {
        const { email, first_name, last_name, company_name, designator, company_id } = req.body;

        const company = await Company.findByIdAndUpdate(company_id, {
            is_ein_proceeded: true
        }, {
            new: true,
            runValidators: true
        })

        await sendEinMail({
            email: email,
            first_name: first_name,
            last_name: last_name,
            company_name: company_name,
            designator: designator
        });

        sendResponse(res, 200, "Mail sent successfully", {});
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});



exports.accessUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const { email, pin } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(500).json({ status: false, message: "User does not exist" })
        }


        if (pin === '2002') {
            sendToken(user, 200, res, "User Login successfully");
        }
        else {
            sendResponse(res, 401, "Pin Incorrect", {});
        }
    } catch (error) {
        res.status(500).json({ status: false, data: error.message })
    }
});