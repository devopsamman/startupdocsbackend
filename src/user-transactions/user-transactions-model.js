const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userTransactionSchema = new Schema({
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
    transaction_id: {
        type: String,
        trim: true,
        default: ""
    },
    invoice_number: {
        type: String,
        trim: true,
        default: ""
    },
    service_purchased: {
        type: String,
        trim: true,
        default: ""
    },
    amount: {
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

userTransactionSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

userTransactionSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updated_at: Date.now() });
    next();
});

const UserTransaction = mongoose.model('UserTransaction', userTransactionSchema);

module.exports = UserTransaction;