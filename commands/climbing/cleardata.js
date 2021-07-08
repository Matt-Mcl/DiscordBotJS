const fetch = require('node-fetch');

module.exports = {
    name: 'cleardata',
    group: 'climbing',
    description: '```.cleardata \nClears all stored climbing data```',
    async execute(msg, args, redisClient) {
        function scan() {
            let cursor = '0';

            redisClient.scan(cursor, 'MATCH', 'Climbing count: *', 'COUNT', '1000', function(err, reply) {
                if (err) {
                    throw err;
                }
                cursor = reply[0];
                if (cursor === '0') {
                    return console.log("Scan Completed");
                } else {
                    console.log(reply[1]);
                    return scan();
                }
            });
        }

        // let data = await db.list("Climbing count: ");

        // for (let key of data) {
        //     let value = await db.get(key);
        //     db.delete(key);
        // }

        msg.channel.send('Cleared all data');

    },
};

