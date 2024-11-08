module.exports = {
    name: 'ban',
    description: 'Banea a un usuario',
    async execute(message, args) {
        try {
            if (!message.member.permissions.has('BAN_MEMBERS')) {
                return message.reply('No tienes permisos para usar este comando.');
            }

            const target = message.mentions.members.first();
            if (!target) {
                return message.reply('Por favor menciona al usuario que deseas banear.');
            }

            await target.ban();
            message.channel.send(`${target.user.tag} ha sido baneado.`);
        } catch (error) {
            console.error('Error al ejecutar el comando ban:', error);
            message.reply('Hubo un error al intentar ejecutar el comando. (Talvez eres Gay)');
        }
    }
};
