const { MessageCollector } = require('discord.js');

module.exports = {
    name: 'prueba',
    description: 'Mutea a un usuario',
    async execute(message, args){
        const lista = ['Advertencia 1', 'Advertencia 2', 'Advertencia 3'];
        const filter = response => response.author.id === message.author.id && !isNaN(response.content);

        message.channel.send(`Advertencias:\n${lista.map((item, index) => `${index + 1}. ${item}`).join('\n')}\nElige el número de la advertencia que deseas quitar (10 Segundos para elegir):`);

        const collector = message.channel.createMessageCollector({ filter, time: 10000 });

        collector.on('collect', msg => {
            const index = parseInt(msg.content) - 1;
            if (index >= 0 && index < lista.length) {
                message.channel.send(`Has seleccionado quitar: ${lista[index]}`);
                collector.stop('Seleccion completada');
            } else {
                message.channel.send('Índice no válido. Por favor, intenta de nuevo.');
            }
        });

        collector.on('end', (collected, reason) => {
            console.log(`Collected ${collected.size} messages. Reason: ${reason}`);
            if (reason === 'time') {
                message.reply('El tiempo se ha agotado.');
            } else {
                message.reply('El colector ha terminado.');
            }
        });
},
}