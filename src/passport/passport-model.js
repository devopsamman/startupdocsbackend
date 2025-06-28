const mongoose = require('mongoose');
const { Schema } = mongoose;

const passportSchema = new Schema({
    member_id: {
        type: String,
        trim: true,
        default: ""
    },
    passport: {
        type: String,
        trim: true,
        default: ""
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

passportSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Passport = mongoose.model('Passport', passportSchema);

module.exports = Passport;