module.exports = {
    name: 'unban',
    description: 'Desbanea a un usuario',
    async execute(message, args) {
        if (!message.member.permissions.has('BAN_MEMBERS')) {
            return message.reply('No tienes permisos para usar este comando.');
        }

        const userId = args[0];
        if (!userId) {
            return message.reply('Por favor proporciona el ID del usuario que deseas desbanear.');
        }

        try {
            await message.guild.members.unban(userId);
            message.channel.send(`El usuario con ID ${userId} ha sido desbaneado.`);
        } catch (error) {
            console.error('Error al ejecutar el comando unban:', error);
            message.reply('Hubo un error al intentar desbanear al usuario.');
        }
    }
};
