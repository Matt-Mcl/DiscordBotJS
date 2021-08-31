const fetch = require('node-fetch');

module.exports = {
    name: 'import',
    aliases: ['i'],
    group: 'climbing',
    description: '```.import [file] \nAllows importing data in the same format it is exported.\n{Only enabled in development environment}```',
    async execute(msg, args, redisClient, climbingData) {
        if (process.env.ENVIRONMENT === 'PROD') return msg.channel.send('This command cannot be used in production');
        const file = msg.attachments.first()?.url;
        const response = await fetch(file);
        let data = await response.text();

        data = data.split('\n');
        data.shift();
        data.pop();

        for (let entry of data) {
            let date = entry.substring(1, 18);
            let count = entry.substring(20, entry.length);

            redisClient.set(`Climbing count: ${date}`, `${count}`);
        }
    },
};
