module.exports = {
    name: 'info',
    description: 'Información sobre el bot',
    execute(message, args) {
        message.channel.send('Soy un bot de Discord creado con Node.js!');
    },
};
