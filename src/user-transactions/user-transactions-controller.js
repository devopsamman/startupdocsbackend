const ShortUniqueId = require("short-unique-id");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const UserTransaction = require("./user-transactions-model");

exports.createUserTransaction = catchAsyncErrors(async (req, res, next) => {
    try {

        const uniqueNumId = new ShortUniqueId({ length: 4, dictionary: "number" });
        const currentUniqueId = uniqueNumId.rnd();

        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const year = now.getFullYear();

        const invoice_number = `${month}${day}${year}${currentUniqueId}`;

        const newUserTransaction = await UserTransaction.create({ ...req.body, invoice_number });
        sendResponse(res, 200, "User Transaction Created Successfully", newUserTransaction);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getAllUserTransactions = catchAsyncErrors(async (req, res, next) => {
    try {

        const { pageNumber } = req.query;
        const totalUserTransactions = await UserTransaction.countDocuments({});

        const userTransactions = await UserTransaction.find({})
            .skip((pageNumber - 1) * 15)
            .sort({ created_at: -1 })
            .limit(15)
            .populate('user_id', 'first_name last_name')
            .populate('company_id', 'company_name designator');

        sendResponse(res, 200, "Customer Data Fetched Successfully", {
            totalUserTransactions: totalUserTransactions,
            totalPages: Math.ceil(totalUserTransactions / 15),
            currentPage: parseInt(pageNumber, 10),
            userTransactions,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getAllUserTransactionsByUser = catchAsyncErrors(async (req, res, next) => {
    try {

        const { pageNumber } = req.query;
        const userId = req.params.id;
        const totalUserTransactions = await UserTransaction.countDocuments({ user_id: userId });

        const userTransactions = await UserTransaction.find({ user_id: userId })
            .skip((pageNumber - 1) * 15)
            .sort({ created_at: -1 })
            .limit(15)
            .populate('user_id', 'first_name last_name')
            .populate('company_id', 'company_name designator');

        sendResponse(res, 200, "Customer Data Fetched Successfully", {
            totalUserTransactions: totalUserTransactions,
            totalPages: Math.ceil(totalUserTransactions / 15),
            currentPage: parseInt(pageNumber, 10),
            userTransactions,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.searchUserTransactions = catchAsyncErrors(async (req, res, next) => {
    try {

        const searchString = req.params.term;
        const { pageNumber } = req.query;

        const query = {
            $or: [
                { user_name: { $regex: searchString, $options: "i" } },
            ],
        };

        const totalUserTransactions = await UserTransaction.countDocuments(query);

        const userTransactions = await UserTransaction.find(query)
            .sort({ created_at: -1 })
            .skip((pageNumber - 1) * 15)
            .limit(15);

        if (!userTransactions.length) {
            return next(
                new ErrorHandler("No user transaction found matching the criteria", 404)
            );
        }

        sendResponse(res, 200, "All user transaction fetched successfully.", {
            totalUserTransactions: totalUserTransactions,
            totalPages: Math.ceil(totalUserTransactions / 15),
            currentPage: parseInt(pageNumber, 10),
            userTransactions
        });

    } catch (error) {
        next(new ErrorHandler(error.message, 500));
    }
});

exports.updateUserTransaction = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;

        const updatedUserTransaction = await UserTransaction.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedUserTransaction) {
            return next(new ErrorHandler("User Transaction Not Found", 404));
        }

        sendResponse(res, 200, "User Transaction Updated Successfully", updatedUserTransaction);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.deleteUserTransaction = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;

        const deletedUserTransaction = await UserTransaction.findByIdAndDelete(id);

        if (!deletedUserTransaction) {
            return res.status(400).json({ message: "Transaction Not Found" });
        }

        sendResponse(res, 200, "User Transaction Deleted Successfully", deletedUserTransaction);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})