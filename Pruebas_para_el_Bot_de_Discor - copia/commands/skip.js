module.exports = {
    name: 'skip',
    description: 'Mutea a un usuario',
    async execute (message, args,player){

        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) return message.channel.send('Pelotudo')
        
        const queue = player.queues.get(message.guild);

        if (!queue) return message.channel.send('NO HAY ESENCIA')
        queue.node.skip();
        message.channel.send('SIGUIENTE ESENCIA')
    }
}