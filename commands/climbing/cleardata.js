const redisScan = require('node-redis-scan');
require('dotenv').config();

module.exports = {
    name: 'cleardata',
    group: 'climbing',
    description: '```.cleardata \nClears all stored climbing data\n{Only enabled in development environment}```',
    async execute(msg, args, redisClient) {
        if (process.env.ENVIRONMENT === 'PROD') return msg.channel.send('This command cannot be used in production');
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

