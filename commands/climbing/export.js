const Discord = require('discord.js');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const redisScan = require('node-redis-scan');

module.exports = {
    name: 'export',
    group: 'climbing',
    description: '```.export [DD/MM/YYYY] \nProvides file of climbing data.\nIf no date is provided, all data is given.\n"list" can be used as an argument to see dates available.```',
    async execute(msg, args, redisClient) {
        const scanner = new redisScan(redisClient);

        async function scan(query) {
            return await new Promise((resolve, reject) => {
                return scanner.scan(query, (err, matches) => {
                    resolve(matches.sort());
                });
            });
        }

        let scanQuery = 'Climbing count: *';

        if (args[0] === 'list') {
            let dates = [];
            let keys = await scan(scanQuery);
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
        }

        if (args.length > 0) {
            const re = /([0-9]{2}[/]){2}[0-9]{4}/
            if (!re.test(args[0])) return msg.channel.send('Please enter a valid date');

            scanQuery = `Climbing count: ${args[0]}*`;
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
