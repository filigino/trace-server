const mongoose = require('mongoose')
const {Schema} = mongoose

const infectionSchema = new Schema({
    infections: [
        {
            id: {
                type: String
            },
            createdAt: {
                type: Number,
                default: Date.now()
            }
        }
    ]
})

module.exports = mongoose.model('Infection', infectionSchema)
