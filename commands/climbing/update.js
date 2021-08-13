const fetch = require('node-fetch');

module.exports = {
    name: 'update',
    aliases: ['u'],
    group: 'climbing',
    description: '```.update \nOverwrites data in local database with data from production database\n{Only enabled in development environment}```',
    async execute(msg, args, redisClient) {
        if (process.env.ENVIRONMENT === 'PROD') return msg.channel.send('This command cannot be used in production');
        const response = await fetch('https://climbing-app.co.uk/data');
        const json = await response.json();

        for (let item of json) {
          redisClient.set(`Climbing count: ${item.datetime}`, `${item.count}`);
        }

        msg.channel.send(`Updated data`);
    },
};
