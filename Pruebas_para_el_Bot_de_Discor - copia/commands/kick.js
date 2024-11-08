module.exports = {
    name: 'kick',
    description: 'Expulsa a un usuario',
    async execute(message, args) {
        try {
            if (!message.member.permissions.has('KICK_MEMBERS')) {
                return message.reply('No tienes permisos para usar este comando.');
            }

            const target = message.mentions.members.first();
            if (!target) {
                return message.reply('Por favor menciona al usuario que deseas expulsar.');
            }

            await target.kick();
            message.channel.send(`${target.user.tag} ha sido expulsado.`);
        } catch (error) {
            console.error('Error al ejecutar el comando kick:', error);
            message.reply('Hubo un error al intentar ejecutar el comando.');
        }
    }
};
