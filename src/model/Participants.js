const mongoose = require('mongoose')
const Schema = mongoose.Schema

const participantSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    lastStatus: {
        type: Date,
        required: true
    },
})

module.exports = mongoose.model('Participant', participantSchema)