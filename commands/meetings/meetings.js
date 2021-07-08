const Discord = require('discord.js');

module.exports = {
    name: 'meetings',
    group: 'meetings',
    description: '```.meetings \nList meetings```',
    async execute(msg, args, db) {
        let description = [];
        let meetings = await db.list("Meeting: ");

        meetings.forEach(function (meeting) {
            let value = meeting.split(" ")
            description.push(`${value[3]} ${value[4]}`);
        });

        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Meetings')
            .setDescription(description);

        msg.channel.send(embed);
            

    },
};