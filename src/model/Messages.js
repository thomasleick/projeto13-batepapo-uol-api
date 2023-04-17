const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('Message', messageSchema);