// commands/play.js
const { Player } = require('discord-player')
module.exports = {
    name: 'play',
    description: 'Mutea a un usuario',
    async execute (message, args,player){

        const voiceChannel = message.member.voice.channel;

        const result = args.join(' ');

        if (!voiceChannel) return message.channel.send('Pelotudo')
        if (!result) return message.channel.send('Pelotudo')

        player.play(voiceChannel, result, {
        nodeOptions: {
        metadata: {
        channel: message.channel,
       },
       selfDeaf: true,
       volume: 80,
       leaveOnEmpty: true,
       leaveOnEmptyCooldown: 300000,
       leaveOnEnd: true,
       leaveOnEndCooldown: 300000,
      },
     });
    }
    }