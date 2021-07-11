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
       
        let keys = await scan('Climbing count: *');

        let start = keys[0].substring(16, 26);
        let end = keys[keys.length - 1].substring(16, 26);

        return msg.channel.send(`Data available between: \n${start} - ${end}.`);

    },
};