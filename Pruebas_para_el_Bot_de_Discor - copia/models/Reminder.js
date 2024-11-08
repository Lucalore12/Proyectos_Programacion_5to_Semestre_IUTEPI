const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    remindAt: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Reminder', ReminderSchema);
