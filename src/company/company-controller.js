const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const ShortUniqueId = require("short-unique-id");
const Company = require("./company-model");
const ServicePurchased = require("../service-purchased/service-purchased-model");
const Documents = require("../document/document-model");
const fs = require("fs");
const { orderReceived, sendOrderToAdmin, sendCompanyFormedMail } = require("../../utils/mail");

const crypto = require('crypto');
const axios = require('axios');


exports.createCompany = catchAsyncErrors(async (req, res, next) => {
    try {
        const { members, addons, services, user_id, is_super_admin, email, name } = req.body;

        const uniqueNumId = new ShortUniqueId({ length: 5, dictionary: "number" });

        const currentUniqueId = uniqueNumId.rnd();

        const files = req?.files?.map(file => file.filename);

        const Services = JSON.parse(services || []);

        const newMembers = JSON.parse(members)?.map((member, index) => {
            return {
                ...member,
                // passport: files[index]
            }
        })

        console.log('newMembers', newMembers)

        const newCompany = await Company.create({ ...req.body, company_id: "CO" + currentUniqueId, members: newMembers, addons: JSON.parse(addons), services: Services });

        console.log('newCompany', newCompany)

        const populatedCompany = await newCompany.populate('user_id');

        console.log('populatedCompany', populatedCompany)

        if (populatedCompany) {
            try {
                const orderMailResponse = await orderReceived({
                    email: populatedCompany?.user_id?.email,
                    first_name: populatedCompany?.user_id?.first_name,
                    last_name: populatedCompany?.user_id?.last_name,
                    state: newCompany?.state,
                    selected_plan: newCompany?.selected_plan,
                    designator: newCompany?.designator,
                    company_name: newCompany?.company_name,
                    paid_amount: newCompany?.paid_amount
                });

                console.log('orderMailResponse', orderMailResponse)

                await sendOrderToAdmin({
                    email: populatedCompany?.user_id?.email,
                    first_name: populatedCompany?.user_id?.first_name,
                    last_name: populatedCompany?.user_id?.last_name,
                    state: newCompany?.state,
                    selected_plan: newCompany?.selected_plan,
                    designator: newCompany?.designator,
                    company_name: newCompany?.company_name,
                    paid_amount: newCompany?.paid_amount
                });

                console.log('sendOrderToAdmin', sendOrderToAdmin)

            } catch (e) {
                console.log('error in sending mail', e)
            }

        }


        for (const service of Services) {
            await ServicePurchased.create({
                user_id,
                company_id: newCompany?._id,
                service_name: service?.text,
                service_description: service?.description,
                service_amount: service?.amt,
                total_amount: service?.amt,
                paid_amount: service?.amt,
            });
        }


        sendResponse(res, 200, "Company Created Successfully", newCompany);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.updateCompany = catchAsyncErrors(async (req, res, next) => {
    try {

        const companyId = req.params.id;

        const updatedCompany = await Company.findByIdAndUpdate(companyId, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedCompany) {
            return next(new ErrorHandler("Company Not Found", 404));
        }

        sendResponse(res, 200, "Company Updated Successfully", updatedCompany);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});


exports.sendCompanyFormed = catchAsyncErrors(async (req, res, next) => {
    try {

        const { company_name, name, designator, email } = req.body;

        await sendCompanyFormedMail({
            email: email,
            designator: designator,
            name: name,
            company_name: company_name,
        });

        sendResponse(res, 200, "Company formed mail sent successfully", {});

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.deleteCompany = catchAsyncErrors(async (req, res, next) => {
    try {
        const companyId = req.params.id;

        const deletedCompany = await Company.findByIdAndDelete(companyId);

        if (!deletedCompany) {
            return next(new ErrorHandler("Company Not Found", 404));
        }

        sendResponse(res, 200, "Company Deleted Successfully", deletedCompany);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getAllCompany = catchAsyncErrors(async (req, res, next) => {
    try {
        const { pageNumber } = req.query;
        const totalCompany = await Company.countDocuments();

        const companies = await Company.find({})
            .sort({ created_at: -1 })
            .skip((pageNumber - 1) * 15)
            .limit(15)
            .populate('user_id', 'country first_name last_name email phone');

        sendResponse(res, 200, "Company Fetched Successfully", {
            totalCompany,
            totalPages: Math.ceil(totalCompany / 15),
            currentPage: parseInt(pageNumber, 10),
            companies
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getCompanyByUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const userId = req.params.id

        const userCompany = await Company.find({ user_id: userId })
            .sort({ created_at: -1 })

        sendResponse(res, 200, "Company Fetched Successfully", userCompany);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getCompanyStats = catchAsyncErrors(async (req, res, next) => {
    try {
        const companyId = req.params.id

        const documents = await Documents.countDocuments({ company_id: companyId })
        const servicePurchased = await ServicePurchased.countDocuments({ company_id: companyId })

        sendResponse(res, 200, "Company Stats Fetched Successfully", {
            documents,
            servicePurchased
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});


exports.createMember = catchAsyncErrors(async (req, res, next) => {
    try {
        const companyId = req.params.id;

        const company = await Company.findOne({
            _id: companyId
        });

        if (!company) {
            return next(new ErrorHandler("Comapany Not Found", 404));
        }


        company.members.push({ ...req.body, passport: req.file?.filename });

        await company.save();

        sendResponse(res, 200, "Member Passport Updated Successfully", company);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.updateMember = catchAsyncErrors(async (req, res, next) => {
    try {

        const companyId = req.params.id;

        const memberId = req.body.memberId;

        const updatedCompany = await Company.findOneAndUpdate(
            { _id: companyId, "members._id": memberId },
            { $set: { "members.$": req.body } },
            { new: true, runValidators: true }
        );

        if (!updatedCompany) {
            return next(new ErrorHandler("Company Not Found", 404));
        }

        sendResponse(res, 200, "Company Updated Successfully", updatedCompany);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});


exports.updateMemberWithPassport = catchAsyncErrors(async (req, res, next) => {
    try {
        const companyId = req.params.id;

        const memberId = req.body.memberId;

        const company = await Company.findOne({
            _id: companyId
        });

        if (!company) {
            return next(new ErrorHandler("Member Not Found", 404));
        }


        company.members = company?.members.map((member, index) => {
            if (member._id.toString() === memberId) {

                if (member?.passport) {
                    fs.unlink(`uploads/passports/${member?.passport}`, (error) => {
                        if (error) {
                            // return next(new ErrorHandler(error.message, 500));
                        } else {
                            console.log("file deleted");
                        }
                    })
                }

                return {
                    ...member,
                    passport: req.file?.filename,
                    first_name: req.body?.first_name,
                    last_name: req.body?.last_name,
                    phone: req.body?.phone,
                    role: req.body?.role,
                    address: req.body?.address,
                    responsible_member: req.body?.responsible_member
                }
            } else {
                return member
            }
        })

        await company.save();

        sendResponse(res, 200, "Member Passport Updated Successfully", company);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.deleteMember = catchAsyncErrors(async (req, res, next) => {
    try {

        const companyId = req.params.id;

        const memberId = req.body.memberId;

        const updatedCompany = await Company.findOneAndUpdate(
            { _id: companyId },
            { $pull: { members: { _id: memberId } } },
            { new: true, runValidators: true }
        );

        if (!updatedCompany) {
            return next(new ErrorHandler("Company Not Found", 404));
        }

        sendResponse(res, 200, "Member Deleted Successfully", updatedCompany);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.searchCompany = catchAsyncErrors(async (req, res, next) => {
    try {
        const { term } = req.params;

        const pageNumber = req.query.pageNumber;

        const query = {
            $or: [
                { company_name: { $regex: term, $options: "i" } },
                { name: { $regex: term, $options: "i" } },
                { phone: { $regex: term, $options: "i" } },
                { email: { $regex: term, $options: "i" } },
                { company_id: { $regex: term, $options: "i" } },
                { state: { $regex: term, $options: "i" } },
                { selected_plan: { $regex: term, $options: "i" } },
                { ein: { $regex: term, $options: "i" } },
                { itin: { $regex: term, $options: "i" } },
                { website: { $regex: term, $options: "i" } },
                { designator: { $regex: term, $options: "i" } },
                { industry: { $regex: term, $options: "i" } },
                { status: { $regex: term, $options: "i" } },
            ],
        };

        const totalCompany = await Company.countDocuments(query);

        const companies = await Company.find(query)
            .sort({ created_at: -1 })
            .skip((pageNumber - 1) * 15)
            .limit(15)
            .populate('user_id', 'country first_name last_name email phone');

        sendResponse(res, 200, "All Companies Fetched Successfully", {
            totalCompany,
            totalPages: Math.ceil(totalCompany / 15),
            currentPage: parseInt(pageNumber, 10),
            companies,
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})



exports.createPhonePePayment = catchAsyncErrors(async (req, res, next) => {
    try {
        const salt_key = process.env.PHONEPE_SALT_KEY || 'fec485a7-0ef4-47d8-ad85-f1925c931c38';
        const merchant_id = process.env.PHONEPE_MERCHANT_ID || 'M22WKFI8JR5F2';
        const salt_index = process.env.PHONEPE_SALT_INDEX || '1';

        const merchantTransactionId = req.body.transactionId;
        const backendUrl = process.env.BACKEND_URL || 'https://startupdocsbackend.onrender.com';

        const data = {
            merchantId: merchant_id,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: req.body.user_id,
            name: req.body.name,
            amount: Math.round(Number(req.body.amount || 0) * 100),
            redirectUrl: `${backendUrl}/api/company/check-payment-status/${merchantTransactionId}/${merchant_id}`,
            redirectMode: 'POST',
            mobileNumber: req.body.number,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };
        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = salt_index;
        const string = payloadMain + '/pg/v1/pay' + salt_key;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        const prod_URL = process.env.PHONEPE_HOST_URL || "https://api.phonepe.com/apis/hermes/pg/v1/pay";
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
            });
        }).catch(function (error) {
            console.error('PhonePe initiation error:', error.message);
            return res.status(502).json({
                status: false,
                message: "Payment gateway error: " + (error.response?.data?.message || error.message)
            });
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
});


exports.checkPhonePePaymentStatus = catchAsyncErrors(async (req, res, next) => {
    const salt_key = process.env.PHONEPE_SALT_KEY || 'fec485a7-0ef4-47d8-ad85-f1925c931c38';
    const salt_index = process.env.PHONEPE_SALT_INDEX || '1';
    const frontendUrl = process.env.FRONTEND_URL || 'https://startupdocs.in';

    const merchantTransactionId = req.params.merchantTransactionId;
    const merchantId = req.params.merchantId;

    const keyIndex = salt_index;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;

    const hostUrl = process.env.PHONEPE_STATUS_URL || "https://api.phonepe.com/apis/hermes";
    const options = {
        method: 'GET',
        url: `${hostUrl}/pg/v1/status/${merchantId}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': `${merchantId}`
        }
    };

    // CHECK PAYMENT STATUS
    axios.request(options).then(async (response) => {
        if (response.data && response.data.success === true) {
            return res.redirect(`${frontendUrl}/success`);
        } else {
            return res.redirect(`${frontendUrl}/failure`);
        }
    }).catch((error) => {
        console.error('Payment status check error:', error.message);
        return res.redirect(`${frontendUrl}/failure`);
    });
});

exports.getAllCompanyForOption = catchAsyncErrors(async (req, res, next) => {
    try {
        const companies = await Company.find({})
            .sort({ created_at: -1 })

        sendResponse(res, 200, "Company Fetched Successfully", companies);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});