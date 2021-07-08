const fetch = require('node-fetch');

module.exports = {
    name: 'cleardata',
    group: 'climbing',
    description: '```.cleardata \nClears all stored climbing data```',
    async execute(msg, args, db) {
        let data = await db.list("Climbing count: ");

        for (let key of data) {
            let value = await db.get(key);
            db.delete(key);
        }

        msg.channel.send('Cleared all data');
    },
};