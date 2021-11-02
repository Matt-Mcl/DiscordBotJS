const fetch = require('node-fetch');

module.exports = {
  name: 'updateclimbing',
  aliases: ['uc'],
  group: 'climbing',
  description: `${process.env.PREFIX}updateclimbing \n\nOverwrites climbing data in local database with data from production database\n\n{Only enabled in development environment}`,
  async execute(msg, args, climbingData) {
    if (process.env.ENVIRONMENT === 'PROD') return msg.channel.send('This command cannot be used in production');
    await climbingData.deleteMany({});
    const response = await fetch(`${process.env.CLIMBING_API_SERVER}/data`);
    const json = await response.json();

    for (let item of json) {
      climbingData.insertOne({ _id: item._id, count: item.count}, (err, result) => { });
    }

    msg.channel.send(`Updated climbing data`);
  },
};
