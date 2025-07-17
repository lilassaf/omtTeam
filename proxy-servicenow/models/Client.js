// models/Client.js
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    u_first_name: { type: String, required: true },
    u_last_name: { type: String, required: true },
    u_username: { type: String, required: true, unique: true },
    u_email_address: { type: String, required: true, unique: true },
    u_password: { type: String, required: true },
    u_phone_number: { type: String },
    u_address: { type: String },
    u_city: { type: String },
    u_province: { type: String },
    u_country: { type: String },
    u_postal_code: { type: String },
    u_date_of_birth: { type: Date },
    u_account_creation_date: { type: Date },
    u_last_login_date: { type: Date },
    u_account_status: { type: String, enum: ['active', 'suspended', 'deleted', 'pending'], default: 'active' },
    verificationTokenExpires: Date,
    u_user_role: { type: String, enum: ['client', 'admin'], default: 'client' },
    u_preferred_payment_method: { type: String, enum: ['credit card', 'paypal', 'bank transfer'], default: 'credit card' },
    u_contact: {
        link: { type: String },
        value: { type: String }
    },
    sys_id: { type: String, unique: true },
    sys_created_on: { type: Date },
    sys_updated_on: { type: Date },
    sys_created_by: { type: String },
    sys_updated_by: { type: String },
    sys_mod_count: { type: Number, default: 0 },
    sys_tags: [{ type: String }]
});

module.exports = mongoose.model('Client', clientSchema);