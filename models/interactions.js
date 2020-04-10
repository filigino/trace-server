const mongoose = require('mongoose')
const {Schema} = mongoose

const interactionSchema = new Schema({
    user_a: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user_b: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: 
        [{type: Number}],
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 1209600 // 14 days in seconds
    }
})

module.exports = mongoose.model('Interaction', interactionSchema)
