const Warning = require('../models/Warning');
const { MessageCollector } = require('discord.js');
module.exports = {
    name: 'unwarn',
    description: 'UnWarn a user',
    async execute(message, args) {
        try {
            if (!message.member.permissions.has('BAN_MEMBERS')) {
                return message.reply('No tienes permisos para usar este comando.');
            }
    
            const user = message.mentions.users.first();
            if (!user) return message.reply('Por favor menciona al usuario del cual deseas quitar una advertencia.');
    
            const warnings = await Warning.find({ userId: user.id, guildId: message.guild.id });
            if (warnings.length === 0) return message.reply('Este usuario no tiene advertencias.');
    
            let warningList = 'Advertencias de ' + user.tag + ':\n';
            warnings.forEach((warn, index) => {
                warningList += `${index + 1}. Razón: ${warn.reason}\n`;
            });
    
            message.channel.send(warningList + '\nElige el número de la advertencia que deseas quitar (tienes 10 segundos):');
    
            const filter = response => response.author.id === message.author.id && !isNaN(response.content) && parseInt(response.content) > 0 && parseInt(response.content) <= warnings.length;

            const collector = message.channel.createMessageCollector({ filter, time: 10000 });
    
            collector.on('collect', async msg => {
                const warningIndex = parseInt(msg.content) - 1;
                console.log(`Índice seleccionado: ${warningIndex}`); // Depuración
                const warningToRemove = warnings[warningIndex];
                console.log(`Advertencia a eliminar: ${warningToRemove}`); // Depuración
    
                if (warningIndex >= 0 && warningIndex < warnings.length) {
                    message.channel.send(`Has seleccionado quitar: ${warnings[warningIndex].reason}`);
                    await Warning.deleteOne({ _id: warningToRemove._id });
                    message.channel.send(`La advertencia número ${warningIndex + 1} ha sido eliminada.`);
                    collector.stop('Seleccion completada');
                } else {
                    message.channel.send('Índice no válido. Por favor, intenta de nuevo.');
                }
            });
    
            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    message.reply('No se ha seleccionado ninguna advertencia dentro del tiempo límite.');
                } else {
                    console.log(`El colector ha terminado. Razón: ${reason}`);
                }
            });
        } catch (error) {
            console.error('Error al ejecutar el comando removewarn:', error);
            message.reply('Hubo un error al intentar ejecutar el comando.');
        }
    }
    ,
};
