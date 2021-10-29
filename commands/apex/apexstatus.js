const fetch = require('node-fetch');

module.exports = {
  name: 'apexstatus',
  aliases: ['as'],
  group: 'apex',
  description: `${process.env.PREFIX}apexstatus \n\nGet status of Apex API`,
  async execute(msg, args, apexdb) {
    const response = await fetch(`https://api.mozambiquehe.re/bridge?version=5&platform=PC&player=${process.env.APEXNAME}&auth=${process.env.APEXAPIKEY}`);
    msg.channel.send(`Apex API returned a status of ${response.status}`);
  },
};
