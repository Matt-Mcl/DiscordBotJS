const Discord = require('discord.js');
const redisScan = require('node-redis-scan');

module.exports = {
    name: 'listdates',
    group: 'climbing',
    description: '```.listdates \nList all the dates that data is stored for```',
    async execute(msg, args, redisClient) {
        const scanner = new redisScan(redisClient);

        async function scan(query) {
            return await new Promise((resolve, reject) => {
                return scanner.scan(query, (err, matches) => {
                    resolve(matches.sort());
                });
            });
        }
       
        let dates = [];
        let keys = await scan('Climbing count: *');

        for (let key of keys) {
            let date = key.substring(16, 26);
            if (dates.indexOf(date) === -1) {
                dates.push(date);
            }
        }

        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Dates stored')
            .setDescription(dates);
            
        return msg.channel.send(embed);

    },
};