const createCsvWriter = require('csv-writer').createObjectCsvWriter;

module.exports = {
    name: 'export',
    group: 'climbing',
    description: '```.export \nProvides file of climbing data```',
    async execute(msg, args, db) {
        let csvWriter = createCsvWriter({
            path: 'export.csv',
            header: [
                {id: 'datetime', title: 'DateTime'},
                {id: 'count', title: 'Count'}
            ]
        });

        let data = await db.list("Climbing count: ");
        let records = [];

        for (let key of data) {
            let value = await db.get(key);
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