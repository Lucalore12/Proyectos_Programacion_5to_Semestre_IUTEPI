const mongoose = require('mongoose');

const WarningSchema = new mongoose.Schema({
    userId: String,
    reason: String,
    guildId: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Warning', WarningSchema);
