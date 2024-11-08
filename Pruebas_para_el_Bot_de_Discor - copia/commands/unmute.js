module.exports = {
    name: 'unmute',
    description: 'Desmutea a un usuario',
    async execute(message, args) {
        if (!message.member.permissions.has('MUTE_MEMBERS')) {
            return message.reply('No tienes permisos para usar este comando.');
        }

        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('Por favor menciona al usuario que deseas desmutear.');
        }

        let muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
        if (!muteRole) {
            return message.reply('El rol de "Muted" no existe.');
        }

        try {
            await target.roles.remove(muteRole);
            message.channel.send(`${target.user.tag} ha sido desmuteado.`);
        } catch (error) {
            console.error('Error al ejecutar el comando unmute:', error);
            message.reply('Hubo un error al intentar desmutear al usuario.');
        }
    }
};
