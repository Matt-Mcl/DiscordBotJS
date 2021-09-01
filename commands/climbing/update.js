const fetch = require('node-fetch');

module.exports = {
    name: 'update',
    aliases: ['u'],
    group: 'climbing',
    description: '```.update \nOverwrites data in local database with data from production database\n{Only enabled in development environment}```',
    async execute(msg, args, redisClient, climbingData) {
        if (process.env.ENVIRONMENT === 'PROD') return msg.channel.send('This command cannot be used in production');
        const response = await fetch(`${process.env.API_SERVER}/data`);
        const json = await response.json();

        for (let item of json) {
          climbingData.insertOne({ _id: item._id, count: item.count}, (err, result) => { });
        }

        msg.channel.send(`Updated data`);
    },
};
