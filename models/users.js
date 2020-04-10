const mongoose = require('mongoose')
const {Schema} = mongoose

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    username_lower: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        min: 0
    },
    sex: {
        type: String,
        enum: ['F', 'M'],
        uppercase: true
    },
    ethnicity: [{
        type: String,
        enum: [
            'American Indian',
            'Black/African Descent',
            'East Asian',
            'Hispanic/Latino',
            'Middle Eastern',
            'Pacific Islander',
            'South Asian',
            'White/Caucasian',
            'Other'
        ]            
    }],
    infected: {
        type: Boolean,
        default: false
    },
    quarantined: {
        type: Boolean,
        default: false
    },
    admin: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})

module.exports = mongoose.model('User', userSchema)
