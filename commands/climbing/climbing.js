const fetch = require('node-fetch');

module.exports = {
    name: 'climbing',
    aliases: ['c'],
    group: 'climbing',
    description: '```.climbing \nLists number of people climbing```',
    execute(msg, args, redisClient) {
        (async () => {
            const response = await fetch('https://portal.rockgympro.com/portal/public/2660c1de4a602e808732f0bcd3fea712/occupancy?&iframeid=occupancyCounter&fId=');
            const text = await response.text();
            let count = text.match(/('count' : ).{1,2}/)[0].substring(10,12);
            if (count.substring(count.length - 1) === ',') {
                count = count.charAt(0);
            }

            msg.channel.send(`There are ${count}/85 people climbing`);
        })()
    },
};