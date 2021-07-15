const Discord = require('discord.js');
const redisScan = require('node-redis-scan');

module.exports = {
    name: 'meetings',
    group: 'meetings',
    description: '```.meetings \nList meetings```',
    async execute(channel, args, redisClient) {
        const scanner = new redisScan(redisClient);

        // let meetings = await db.list("Meeting: ");
        let meetings = await new Promise((resolve, reject) => {
            scanner.scan('Meeting: *', (err, matches) => {
                resolve(matches.sort());
            });
        });

        let description = [];

        meetings.forEach(function (meeting) {
            let value = meeting.split(" ")
            description.push(`${value[3]} ${value[4]}`);
        });

        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Meetings')
            .setDescription(description);

        channel.send(embed);
    },
};