const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const Testimonial = require("./testimonials-model");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");

exports.createTestimonial = catchAsyncErrors(async (req, res, next) => {
    try {
        const newTestimonial = await Testimonial.create(req.body);
        sendResponse(res, 200, "Testimonial Created successfully.", newTestimonial);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.getAllTestimonials = catchAsyncErrors(async (req, res, next) => {
    try {

        const { pageNumber } = req.query;
        const totalTestimonials = await Testimonial.countDocuments();

        const testimonials = await Testimonial.find()
            .sort({ created_at: -1 })
            .skip((pageNumber - 1) * 15)
            .limit(15);

        sendResponse(res, 200, "All testimonials fetched successfully.", {
            totalTestimonials: totalTestimonials,
            totalPages: Math.ceil(totalTestimonials / 15),
            currentPage: parseInt(pageNumber, 10),
            testimonials
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});


exports.getTestimonialByUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const user_id = req.params.id;
        const testimonial = await Testimonial.find({ user_id: user_id })
        sendResponse(res, 200, "User Testimonial fetched successfully.", testimonial);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.deleteTestimonial = catchAsyncErrors(async (req, res, next) => {
    try {
        const testimonialID = req.params.id;

        const testimonialData = await Testimonial.findById(testimonialID);

        if (!testimonialData) {
            return next(new ErrorHandler("testimonial Not Exist", 400));
        }

        const testimonial = await Testimonial.deleteOne({ _id: testimonialID });

        sendResponse(res, 200, "Testimonial Deleted Successfully.", testimonial);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.updateTestimonial = catchAsyncErrors(async (req, res, next) => {
    try {
        const testimonialID = req.params.id;

        const testimonialData = await Testimonial.findById(testimonialID);
        if (!testimonialData) {
            return next(new ErrorHandler("Testimonial Not Exist", 400));
        }

        const testimonial = await Testimonial.findByIdAndUpdate(testimonialID, req.body, {
            new: true,
            runValidators: true,
        })

        sendResponse(res, 200, "Testimonial Updated Successfully.", testimonial);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});