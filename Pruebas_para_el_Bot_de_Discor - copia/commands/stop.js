module.exports = {
    name: 'stop',
    description: 'Mutea a un usuario',
    async execute (message, args,player){

        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) return message.channel.send('Pelotudo')
        
        const queue = player.queues.get(message.guild);

        if (queue){
            message.channel.send('SE ACABO LA ESENCIA')
            queue.delete();
            queue.node.stop();
        }
    }
    }