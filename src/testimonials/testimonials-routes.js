const express = require('express');
const { createTestimonial, getAllTestimonials, updateTestimonial, deleteTestimonial, getTestimonialByUser } = require('./testimonials-controller');
const router = express.Router();


router.post("/create-testimonial", createTestimonial);

router.get("/get-all-testimonials", getAllTestimonials);

router.get("/get-testimonial-by-user/:id", getTestimonialByUser);

router.post("/update-testimonial/:id", updateTestimonial);

router.post("/delete-testimonial/:id", deleteTestimonial);

module.exports = router;