const mongoose = require('mongoose');

const ServerLimitSchema = new mongoose.Schema({
    guildId: String,
    limit: { type: Number, default: 5 }
});

module.exports = mongoose.model('ServerLimit', ServerLimitSchema);
