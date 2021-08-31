const redisScan = require('node-redis-scan');

module.exports = {
    name: 'listdates',
    aliases: ['ld'],
    group: 'climbing',
    description: '```.listdates \nList all the dates that data is stored for```',
    async execute(msg, args, redisClient, climbingData) {
        const scanner = new redisScan(redisClient);

        function formatDatetime(dt) {
            return new Date(`${dt.substring(6, 10)}-${dt.substring(3, 5)}-${dt.substring(0, 2)}T${dt.substring(12)}`);
        }

        async function scan(query) {
            return await new Promise((resolve, reject) => {
                return scanner.scan(query, (err, matches) => {
                    resolve(matches.sort(function(a, b) {
                        return formatDatetime(a.substring(16)) - formatDatetime(b.substring(16));
                    }));
                });
            });
        }
       
        let keys = await scan('Climbing count: *');

        let start = keys[0].substring(16, 26);
        let end = keys[keys.length - 1].substring(16, 26);

        return msg.channel.send(`Data available between: \n${start} - ${end}.`);
    },
};
