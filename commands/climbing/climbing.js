const fetch = require('node-fetch');

module.exports = {
  name: 'climbing',
  aliases: ['c'],
  group: 'climbing',
  description: '```.climbing \nLists number of people climbing```',
  async execute(msg, args, climbingData) {
    const response = await fetch('https://portal.rockgympro.com/portal/public/2660c1de4a602e808732f0bcd3fea712/occupancy');
    const text = await response.text();
    let count = text.match(/('count' : ).{1,3}/)[0].substring(10);
    const capacity = text.match(/('capacity' : ).{1,3}/)[0].substring(13);
    count = count.replace(/[^0-9]/, '');
    if (count.substring(count.length - 1) === ',') {
      count = count.charAt(0);
    }

    msg.channel.send(`There are ${count}/${capacity} people climbing`);
  },
};
