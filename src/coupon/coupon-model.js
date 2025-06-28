const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
    coupon_code: {
        type: String,
        unique: true,
        trim: true
    },
    discount_value: {
        type: Number,
        default: 0,
    },
    is_active: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

couponSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

couponSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updated_at: Date.now() });
    next();
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
