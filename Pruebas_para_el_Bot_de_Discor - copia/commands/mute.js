module.exports = {
    name: 'mute',
    description: 'Mutea a un usuario',
    async execute(message, args) {
        try {
            if (!message.member.permissions.has('MUTE_MEMBERS')) {
                return message.reply('No tienes permisos para usar este comando.');
            }

            const target = message.mentions.members.first();
            if (!target) {
                return message.reply('Por favor menciona al usuario que deseas mutear.');
            }

            let muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
            if (!muteRole) {
                muteRole = await message.guild.roles.create({
                    name: 'Muted',
                    color: '#000000',
                    permissions: []
                });

                message.guild.channels.cache.forEach(async (channel) => {
                    await channel.permissionOverwrites.create(muteRole, {
                        SEND_MESSAGES: false,
                        SPEAK: false
                    });
                });
            }

            await target.roles.add(muteRole);
            message.channel.send(`${target.user.tag} ha sido muteado.`);
        } catch (error) {
            console.error('Error al ejecutar el comando mute:', error);
            message.reply('Hubo un error al intentar ejecutar el comando.');
        }
    }
};
