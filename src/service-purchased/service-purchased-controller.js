const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const ServicePurchased = require("./service-purchased-model");
const Company = require("../company/company-model");
const crypto = require('crypto');
const axios = require('axios');

exports.createServicePurchased = catchAsyncErrors(async (req, res, next) => {
    try {
        const { company_id, user_id, service_name, service_amount } = req.body;

        const newServicePurchased = await ServicePurchased.create(req.body);

        const company = await Company.findOne({ _id: company_id });

        if (company?.addons?.length > 0) {
            const newAddon = {
                name: service_name,
                amount: service_amount,
            }

            company.addons.push(newAddon);
            await company.save();
        }
        sendResponse(res, 200, "Service Purchased Successfully", newServicePurchased);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getAllServicePurchased = catchAsyncErrors(async (req, res, next) => {
    try {

        const { pageNumber } = req.query;
        const totalServicePurchased = await ServicePurchased.countDocuments();

        const servicePurchased = await ServicePurchased.find({})
            .skip((pageNumber - 1) * 15)
            .sort({ created_at: -1 })
            .limit(15);

        sendResponse(res, 200, "Customer Data Fetched Successfully", {
            totalServicePurchased: totalServicePurchased,
            totalPages: Math.ceil(totalServicePurchased / 15),
            currentPage: parseInt(pageNumber, 10),
            servicePurchased,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getAllServicePurchasedByCompany = catchAsyncErrors(async (req, res, next) => {
    try {

        const { pageNumber } = req.query;
        const companyId = req.params.id;
        const totalServicePurchased = await ServicePurchased.countDocuments({ company_id: companyId });

        const servicePurchased = await ServicePurchased.find({ company_id: companyId })
            .skip((pageNumber - 1) * 15)
            .sort({ created_at: -1 })
            .limit(15);

        sendResponse(res, 200, "Service Purchased Data Fetched Successfully", {
            totalServicePurchased: totalServicePurchased,
            totalPages: Math.ceil(totalServicePurchased / 15),
            currentPage: parseInt(pageNumber, 10),
            servicePurchased,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.searchServicePurchased = catchAsyncErrors(async (req, res, next) => {
    try {

        const searchString = req.params.term;
        const { pageNumber } = req.query;

        // Convert search term to a number if possible
        const searchNumber = parseFloat(searchString);

        const query = {
            $or: [
                { coupon_code: { $regex: searchString, $options: "i" } },
                ...(isNaN(searchNumber) ? [] : [{ discount_value: searchNumber }])
            ],
        };

        // Execute query
        const totalServicePurchased = await ServicePurchased.countDocuments(query);

        const servicePurchased = await ServicePurchased.find(query)
            .sort({ created_at: -1 })
            .skip((pageNumber - 1) * 15)
            .limit(15);

        if (!servicePurchased.length) {
            return next(
                new ErrorHandler("No service purchased found matching the criteria", 404)
            );
        }

        sendResponse(res, 200, "All Service Purchased fetched successfully.", {
            totalServicePurchased: totalServicePurchased,
            totalPages: Math.ceil(totalServicePurchased / 15),
            currentPage: parseInt(pageNumber, 10),
            servicePurchased
        });

    } catch (error) {
        next(new ErrorHandler(error.message, 500));
    }
});


exports.createPhonePePayment = catchAsyncErrors(async (req, res, next) => {
    try {

        const salt_key = 'fec485a7-0ef4-47d8-ad85-f1925c931c38'
        const merchant_id = 'M22WKFI8JR5F2'

        const merchantTransactionId = req.body.transactionId;

        const data = {
            merchantId: merchant_id,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: req.body.user_id,
            name: req.body.name,
            amount: req.body.amount * 100,
            redirectUrl: `https://api.leegal.co/api/service-purchased/check-payment-status/${merchantTransactionId}/${merchant_id}`,
            redirectMode: 'POST',
            mobileNumber: req.body.number,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };
        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + salt_key;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"
        const options = {
            method: 'POST',
            url: prod_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: payloadMain
            }
        };

        axios.request(options).then(function (response) {
            sendResponse(res, 200, "Payment Initiated", {
                url: response.data.data.instrumentResponse.redirectInfo.url,
            })

        })
            .catch(function (error) {
                console.error(error);
            });

    } catch (error) {
        res.status(500).send({
            message: error.message,
            success: false
        })
    }
});


exports.checkPhonePePaymentStatus = catchAsyncErrors(async (req, res, next) => {

    const salt_key = 'fec485a7-0ef4-47d8-ad85-f1925c931c38'

    const merchantTransactionId = req.params.merchantTransactionId
    const merchantId = req.params.merchantId

    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;

    const options = {
        method: 'GET',
        url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': `${merchantId}`
        }
    };

    axios.request(options).then(async (response) => {
        if (response.data.success === true) {
            const url = `https://www.leegal.co/success-v2`
            return res.redirect(url)
        } else {
            const url = `https://www.leegal.co/failure-v2`
            return res.redirect(url)
        }
    })
        .catch((error) => {
            console.error(error);
        });
});