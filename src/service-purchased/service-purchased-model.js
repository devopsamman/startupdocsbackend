const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const servicePurchasedSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    company_id: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        default: null,
    },
    service_name: {
        type: String,
        trim: true,
        default: ""
    },
    service_description: {
        type: String,
        trim: true
    },
    service_amount: {
        type: String,
        trim: true,
        default: ""
    },
    discount_amount: {
        type: String,
        trim: true,
        default: ""
    },
    total_amount: {
        type: String,
        trim: true,
        default: ""
    },
    paid_amount: {
        type: String,
        trim: true,
        default: ""
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

servicePurchasedSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

servicePurchasedSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updated_at: Date.now() });
    next();
});

const ServicePurchased = mongoose.model('ServicePurchased', servicePurchasedSchema);

module.exports = ServicePurchased;
