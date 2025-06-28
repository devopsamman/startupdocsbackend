const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const crypto = require('crypto');
const axios = require('axios');

exports.createHash = catchAsyncErrors(async (req, res, next) => {
    try {
        const { name, email, amount, productinfo } = req.body;

        const key = process.env.PAYU_KEY;
        const salt = process.env.PAYU_SALT;

        const txnid = "t" + Date.now() + Math.floor(Math.random() * 1000);

        const formattedAmount = parseFloat(amount).toFixed(2);

        console.log('formattedAmount', formattedAmount,'amount',amount)

        const hashString = `${key}|${txnid}|${formattedAmount}|${productinfo}|${name}|${email}|||||||||||${salt}`;

        const hash = crypto.createHash('sha512').update(hashString).digest('hex');

        sendResponse(res, 200, "Payment Hash Generated", { hash, txnid });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});


exports.success = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log('req.body', req.body)
        res.redirect('https://www.leegal.co/success')
        // sendResponse(res, 200, "Payment Successfull", req.body);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.failure = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log('req.body', req.body)
        res.redirect('https://www.leegal.co/failure')
        // sendResponse(res, 200, "Payment Failed", req.body);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.createHashForServices = catchAsyncErrors(async (req, res, next) => {
    try {
        const { name, email, amount, productinfo } = req.body;

        const key = process.env.PAYU_KEY;
        const salt = process.env.PAYU_SALT;

        const txnid = "t" + Date.now() + Math.floor(Math.random() * 1000);

        const formattedAmount = parseFloat(amount).toFixed(2);

        const hashString = `${key}|${txnid}|${formattedAmount}|${productinfo}|${name}|${email}|||||||||||${salt}`;

        const hash = crypto.createHash('sha512').update(hashString).digest('hex');

        sendResponse(res, 200, "Payment Hash Generated", { hash, txnid });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});