const { Client, GatewayIntentBits, Collection,Partials } = require('discord.js');
const fs = require('fs');

const { Player } = require('discord-player');
const cron = require('node-cron');
const connectDB = require('./db');
connectDB();
const Reminder = require('./models/Reminder');

const { YoutubeiExtractor } = require('discord-player-youtubei');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent ,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages ,
        GatewayIntentBits.GuildMembers ,
    
    ],
    partials: [
      Partials.Channel,
      Partials.Message
    ]
});
let lastDeletedMessage = null;


const prefix = '&';


client.commands = new Collection();


const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('messageDelete', message => {
    if (message.partial) return;

    
    lastDeletedMessage = message;
});

const player = new Player(client);

player.extractors.register(YoutubeiExtractor).then(() =>{console.log('Youtube Cargado')}).catch((e) => console.log(e));

player.events.on('playerStart', (queue, track) => {
    // Emitted when the player starts to play a song
    queue.metadata.channel.send(`QUE INICIE LA ESENCIA **${track.title}**`);
});

player.events.on('audioTrackAdd', (queue, track) => {
    // Emitted when the player adds a single song to its queue
    queue.metadata.channel.send(`NUEVA **${track.title}** ESENCIA`);
});

player.events.on('audioTracksAdd', (queue, track) => {
    // Emitted when the player adds multiple songs to its queue
    queue.metadata.channel.send(`NUEVAS ESENCIAS`);
});

player.events.on('playerSkip', (queue, track) => {
    // Emitted when the audio player fails to load the stream for a song
    queue.metadata.channel.send(`ESO NO TIENE ESENCIA **${track.title}**, ESTO SI`);
});

player.events.on('disconnect', (queue) => {
    // Emitted when the bot leaves the voice channel
    queue.metadata.channel.send('USTEDES NO TIENEN ESENCIA');
});
player.events.on('emptyChannel', (queue) => {
    // Emitted when the voice channel has been empty for the set threshold
    // Bot will automatically leave the voice channel with this event
    queue.metadata.channel.send(`AQUI YA NO HAY ESENCIA`);
});
player.events.on('emptyQueue', (queue) => {
    // Emitted when the player queue has finished
    queue.metadata.channel.send('HA FINALIZADO LA ESENCIA');
});

client.once('ready', () => {
    console.log('¡Estoy listo!');

    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const reminders = await Reminder.find({ remindAt: { $lte: now } });

        reminders.forEach(async reminder => {
            const user = await client.users.fetch(reminder.userId);
            user.send(`Recordatorio: ${reminder.message}`);
            await Reminder.findByIdAndDelete(reminder._id);
        });
    });
});

client.on('messageCreate', async message => {
    
    if (message.author.bot) return;

    const timestamp = new Date().toISOString();
    
    
    
   
    if (message.channel.name === undefined){
        console.log(`DM recibido de ${message.author.username} a las ${timestamp}: ${message.content}`);
    }
    else {

        console.log(`Mensaje recibido de ${message.author.username} en el canal ${message.channel.name} a las ${timestamp}: ${message.content}`);
    }

    if (message.attachments.size > 0) {
        message.attachments.forEach(attachment => {
            
            if (attachment.contentType.startsWith('image/')) {
                console.log(`El mensaje contiene una imagen: ${attachment.url}`);
            }
        });
    }
    

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    try {
        command.execute(message, args,player);
    } catch (error) {
        console.error(error);
        message.reply('Hubo un error al intentar ejecutar ese comando.');
    }

});

//TOken del Bot
client.login('');

