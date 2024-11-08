const Warning = require('../models/Warning');
const ServerLimit = require('../models/ServerLimit');

module.exports = {
    name: 'warn',
    description: 'Warn a user',
     async execute(message, args){
        try {
            if (!message.member.permissions.has('BAN_MEMBERS')) {
                return message.reply('No tienes permisos para usar este comando.');
            }
    
            const user = message.mentions.users.first();
            const reason = args.slice(1).join(' ');
    
            if (!user || !reason) return message.reply('Uso: !warn @usuario [razón]');
    
            await Warning.create({
                userId: user.id,
                reason: reason,
                guildId: message.guild.id
            });
    
            const warningCount = await Warning.countDocuments({ userId: user.id, guildId: message.guild.id });
            const serverLimit = await ServerLimit.findOne({ guildId: message.guild.id }) || { limit: 5 };
            const limit = serverLimit.limit;
    
            if (warningCount >= limit) {
                message.guild.members.ban(user, { reason: 'Demasiadas advertencias' })
                    .then(async () => {
                        message.channel.send(`${user.tag} ha sido baneado por acumular demasiadas advertencias.`);
                        await Warning.deleteMany({ userId: user.id, guildId: message.guild.id });
                    })
                    .catch(err => console.error(err));
            } else {
                message.channel.send(`${user.tag} ha sido advertido. Ahora tiene ${warningCount} advertencias.`);
            }
        } catch (error) {
            console.error('Error al ejecutar el comando warn:', error);
            message.reply('Hubo un error al intentar ejecutar el comando.');
        }
    }
    ,
};
