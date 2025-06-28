const mongoose = require('mongoose');
const { Schema } = mongoose;

const testimonialsSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    review: {
        type: String,
        trim: false
    },
    rating: {
        type: Number,
        default: 0,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    }
});

// Create the model from the schema
const Testimonials = mongoose.model('Testimonials', testimonialsSchema);

module.exports = Testimonials;
