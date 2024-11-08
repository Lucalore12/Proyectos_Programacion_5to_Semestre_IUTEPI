module.exports = {
    name: 'hola',
    description: 'Saludo básico',
    execute(message, args) {
        message.channel.send('¡Hola, mundo!');
    },
};
