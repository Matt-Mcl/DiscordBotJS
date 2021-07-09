const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const redisScan = require('node-redis-scan');

module.exports = {
    name: 'export',
    group: 'climbing',
    description: '```.export \nProvides file of climbing data```',
    async execute(msg, args, redisClient) {
        const scanner = new redisScan(redisClient);

        let csvWriter = createCsvWriter({
            path: 'export.csv',
            header: [
                {id: 'datetime', title: 'DateTime'},
                {id: 'count', title: 'Count'}
            ]
        });

        let keys = await new Promise((resolve, reject) => {
            scanner.scan('Climbing count: *', (err, matches) => {
                resolve(matches);
            });
        });

        keys = keys.sort();
        
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
