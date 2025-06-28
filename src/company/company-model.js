const mongoose = require('mongoose');
const { Schema } = mongoose;
const jwt = require("jsonwebtoken");

const companySchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    company_id: {
        type: String,
        trim: true,
        default: ""
    },
    name: {
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
    gender: {
        type: String,
        trim: true,
        default: ""
    },
    company_name: {
        type: String,
        trim: true,
        default: ""
    },
    state: {
        type: String,
        trim: true,
        default: ""
    },
    state_fee: {
        type: String,
        trim: true,
        default: ""
    },
    designator: {
        type: String,
        trim: true,
        default: ""
    },
    industry: {
        type: String,
        trim: true,
        default: ""
    },
    website: {
        type: String,
        trim: true,
        default: ""
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    ein: {
        type: String,
        trim: true,
        default: ""
    },
    selected_plan: {
        type: String,
        trim: true,
        default: ""
    },
    itin: {
        type: String,
        trim: true,
        default: ""
    },
    reg_agent_name: {
        type: String,
        trim: true,
        default: ""
    },
    reg_agent_address: {
        type: String,
        trim: true,
        default: ""
    },
    premium_mail_address: {
        type: String,
        trim: true,
        default: ""
    },
    members: [
        {
            first_name: String,
            last_name: String,
            phone: String,
            role: String,
            address: String,
            passport: String,
            responsible_member: {
                type: Boolean,
                default: false
            }
        }
    ],
    addons: [
        {
            name: String,
            amount: String,
        }
    ],
    plan_amount: {
        type: String,
        trim: true,
        default: ""
    },
    addons_amount: {
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
    status: {
        type: String,
        trim: true,
        default: "processing"
    },
    is_ein_proceeded: {
        type: Boolean,
        default: false,
    },
    is_active: {
        type: Boolean,
        default: true,
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

companySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;