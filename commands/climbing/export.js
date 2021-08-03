const Discord = require('discord.js');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const redisScan = require('node-redis-scan');

module.exports = {
    name: 'export',
    aliases: ['e'],
    group: 'climbing',
    description: '```.export [DD/MM/YYYY] \nProvides file of climbing data.\nIf no date is provided, all data is given.```',
    async execute(msg, args, redisClient) {
        const scanner = new redisScan(redisClient);

        function formatDatetime(dt) {
            return new Date(`${dt.substring(6, 10)}-${dt.substring(3, 5)}-${dt.substring(0, 2)}T${dt.substring(12)}`);
        }

        async function scan(query) {
            return await new Promise((resolve, reject) => {
                return scanner.scan(query, (err, matches) => {
                    resolve(matches.sort(function(a, b) {
                        a = a.substring(16);
                        b = b.substring(16);
                        return formatDatetime(a) - formatDatetime(b);
                    }));
                });
            });
        }

        let scanQuery = 'Climbing count: *';

        if (args.length > 0) {
            if (!args[0].match(/([0-9]{2}[/]){2}[0-9]{4}/)) {
                return msg.channel.send('Please enter a valid date'); 
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

        if (records.length === 0) return msg.channel.send('No data for given date'); 

        csvWriter.writeRecords(records) 
            .then(() => {
                msg.channel.send('Exported data:', {
                    files: [
                        'export.csv'
                    ]
                });
            });
    },
};
