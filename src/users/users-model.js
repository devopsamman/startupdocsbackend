const mongoose = require('mongoose');
const { Schema } = mongoose;
const jwt = require("jsonwebtoken");

const userSchema = new Schema({
    first_name: {
        type: String,
        trim: true,
        default: ""
    },
    last_name: {
        type: String,
        trim: true,
        default: ""
    },
    user_id: {
        type: String,
        trim: true,
        default: ""
    },
    email: {
        type: String,
        trim: true,
        default: ""
    },
    phone: {
        type: String,
        trim: true,
        default: ""
    },
    password: {
        type: String,
        trim: true,
        default: ""
    },
    country: {
        type: String,
        trim: true,
        default: ""
    },
    is_user: {
        type: Boolean,
        default: true,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
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

userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
