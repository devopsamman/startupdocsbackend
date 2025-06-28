const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const Coupon = require("./coupon-model");

exports.createCoupon = catchAsyncErrors(async (req, res, next) => {
    try {
        const newCoupon = await Coupon.create(req.body);
        sendResponse(res, 200, "Coupon Created Successfully", newCoupon);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getAllCoupon = catchAsyncErrors(async (req, res, next) => {
    try {

        const { pageNumber } = req.query;
        const totalCoupons = await Coupon.countDocuments();

        const coupons = await Coupon.find({})
            .skip((pageNumber - 1) * 15)
            .sort({ created_at: -1 })
            .limit(15);

        sendResponse(res, 200, "Customer Data Fetched Successfully", {
            totalCoupons: totalCoupons,
            totalPages: Math.ceil(totalCoupons / 15),
            currentPage: parseInt(pageNumber, 10),
            coupons,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.getCoupon = catchAsyncErrors(async (req, res, next) => {
    try {
        const { coupon_code } = req.body;

        const coupon = await Coupon.findOne({
            coupon_code: coupon_code
        })

        if (!coupon) {
            return next(new ErrorHandler("Coupon Not Exist", 400));
        }

        sendResponse(res, 200, "Coupon Data Fetched Successfully", coupon);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.deleteCouponByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const couponID = req.params.id;

        const couponData = await Coupon.findById(couponID);
        if (!couponData) {
            return next(new ErrorHandler("Copuon not found", 400));
        }

        const coupon = await Coupon.deleteOne({ _id: couponID });

        sendResponse(res, 200, "Coupon deleted successfully", coupon);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.updateCouponByID = catchAsyncErrors(async (req, res, next) => {
    try {
        const couponID = req.params.id;

        const coupon = await Coupon.findByIdAndUpdate(couponID, req.body, {
            new: true,
            runValidators: true,
        });

        if (!coupon) {
            return next(new ErrorHandler("Coupon not found!", 400));
        }

        sendResponse(res, 200, "Coupon Updated Successfully", coupon);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});




exports.searchCoupons = catchAsyncErrors(async (req, res, next) => {
    try {
        const { term } = req.params;

        const pageNumber = req.query.pageNumber;

        const query = {
            $or: [
                { coupon_code: { $regex: term, $options: "i" } },
                ...(isNaN(Number(term))
                    ? []
                    : [{ discount_value: Number(term) }]),
            ],
        };

        const totalCoupons = await Coupon.countDocuments(query);

        const coupons = await Coupon.find(query)
            .sort({ created_at: -1 })
            .skip((pageNumber - 1) * 15)
            .limit(15);

        sendResponse(res, 200, "All Coupons Fetched Successfully", {
            totalCoupons,
            totalPages: Math.ceil(totalCoupons / 15),
            currentPage: parseInt(pageNumber, 10),
            coupons,
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})