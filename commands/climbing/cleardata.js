const redisScan = require('node-redis-scan');

module.exports = {
    name: 'cleardata',
    group: 'climbing',
    description: '```.cleardata \nClears all stored climbing data```',
    async execute(msg, args, redisClient) {
        const scanner = new redisScan(redisClient);

        let keys = await new Promise((resolve, reject) => {
            scanner.scan('Climbing count: *', (err, matches) => {
                resolve(matches);
            });
        });

        for (let key of keys) {
            let value = await new Promise((resolve, reject) => {
                redisClient.del(key, function(err, reply) {
                    resolve(reply);
                });
            });

        }  

        msg.channel.send('Cleared all data');

    },
};

