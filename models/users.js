const mongoose = require('mongoose')
const {Schema} = mongoose
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new Schema({
    usernameStylized: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date
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

// adds username and password fields
userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema)
