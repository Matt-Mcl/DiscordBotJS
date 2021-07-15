const Discord = require('discord.js');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const redisScan = require('node-redis-scan');

module.exports = {
    name: 'export',
    aliases: ['e'],
    group: 'climbing',
    description: '```.export [DD/MM/YYYY] \nProvides file of climbing data.\nIf no date is provided, all data is given.```',
    async execute(channel, args, redisClient) {
        const scanner = new redisScan(redisClient);

        async function scan(query) {
            return await new Promise((resolve, reject) => {
                return scanner.scan(query, (err, matches) => {
                    resolve(matches.sort());
                });
            });
        }

        let scanQuery = 'Climbing count: *';

        if (args.length > 0) {
            if (!args[0].match(/([0-9]{2}[/]){2}[0-9]{4}/)) {
                return channel.send('Please enter a valid date'); 
            } else {
                scanQuery = `Climbing count: ${args[0]}*`;
            }
        }

        let csvWriter = createCsvWriter({
            path: 'export.csv',
            header: [
                {id: 'datetime', title: 'DateTime'},
                {id: 'count', title: 'Count'}
            ]
        });

        let keys = await scan(scanQuery);

        let records = [];

        for (let key of keys) {
            let value = await new Promise((resolve, reject) => {
                redisClient.get(key, function(err, reply) {
                    resolve(reply);
                });
            });
            let date = key.substring(16, key.length);

            records.push({datetime: date, count: value});
        }            

        if (records.length === 0) return channel.send('No data for given date'); 

        csvWriter.writeRecords(records) 
            .then(() => {
                channel.send('Exported data:', {
                    files: [
                        'export.csv'
                    ]
                });
            });
    },
};
