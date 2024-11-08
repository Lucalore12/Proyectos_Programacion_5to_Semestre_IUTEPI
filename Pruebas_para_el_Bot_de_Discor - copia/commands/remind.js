const Reminder = require('../models/Reminder');

module.exports = {
    name: 'remind',
    description: 'Crea un recordatorio',
    async execute(message, args) {
        const timeValue = parseInt(args.shift());
        const timeUnit = args.shift();
        const reminderMessage = args.join(' ');

        let remindAt = new Date();
        if (timeUnit === 'second') {
            remindAt.setSeconds(remindAt.getSeconds() + timeValue);
        } else if (timeUnit === 'minute') {
            remindAt.setMinutes(remindAt.getMinutes() + timeValue);
        } else if (timeUnit === 'hour') {
            remindAt.setHours(remindAt.getHours() + timeValue);
        } else if (timeUnit === 'day') {
            remindAt.setDate(remindAt.getDate() + timeValue);
        } else {
            message.channel.send('Formato incorrecto. Usa: !remind <cantidad> <unidad (minutes/hours/days)> <mensaje>');
            return;
        }

        const reminder = new Reminder({
            userId: message.author.id,
            message: reminderMessage,
            remindAt: remindAt
        });

        await reminder.save();
        message.channel.send(`Te recordaré: "${reminderMessage}" en ${timeValue} ${timeUnit}.`);
    }
};
