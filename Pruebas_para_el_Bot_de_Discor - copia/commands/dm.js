module.exports = {
    name: 'dm',
    description: 'Envía un mensaje directo a un usuario',
    async execute(message, args) {
        const userId = args.shift(); 
        const dmMessage = args.join(' '); 

       
        try {
            const user = await message.client.users.fetch(userId);
            await user.send(dmMessage);
            message.channel.send(`Mensaje enviado a ${user.username}`);
        } catch (error) {
            console.error('Error al enviar el mensaje directo:', error);
            message.channel.send('Hubo un error al intentar enviar el mensaje directo.');
        }
    }
};
