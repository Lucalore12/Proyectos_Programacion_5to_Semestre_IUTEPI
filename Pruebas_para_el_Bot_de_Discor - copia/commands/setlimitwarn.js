const ServerLimit = require('../models/ServerLimit');

module.exports = {
    name: 'setlimitwarn',
    description: 'Set warning limit for a server',
    async execute(message, args) {
        const limit = parseInt(args[0], 10);

        if (isNaN(limit) || limit <= 0) return message.reply('Uso: !setlimit [número positivo]');

        await ServerLimit.findOneAndUpdate(
            { guildId: message.guild.id },
            { limit: limit },
            { upsert: true }
        );

        return message.reply(`El límite de advertencias para este servidor ha sido establecido en ${limit}.`);
    },
};
