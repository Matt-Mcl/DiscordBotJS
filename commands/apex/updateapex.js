module.exports = {
  name: 'updateapex',
  aliases: ['ua'],
  group: 'apex',
  description: '```.updateapex \nOverwrites apex data in local database with data from production database\n{Only enabled in development environment}```',
  async execute(msg, args, apexdb) {
    if (process.env.ENVIRONMENT === 'PROD') return msg.channel.send('This command cannot be used in production');

    const rankScoreData = apexdb.collection('rankScoreData');
    const arenaScoreData = apexdb.collection('arenaScoreData');

    let response = await fetch(`${process.env.APEX_API_SERVER}/rankdata`);
    let json = await response.json();

    for (let item of json) {
      rankScoreData.insertOne({ score: item.score, name: item.name, div: item.div, img: item.img, season: item.season }, (err, result) => { });
    }

    response = await fetch(`${process.env.APEX_API_SERVER}/arenadata`);
    json = await response.json();

    for (let item of json) {
      arenaScoreData.insertOne({ score: item.score, name: item.name, div: item.div, img: item.img, season: item.season }, (err, result) => { });
    }

    msg.channel.send(`Updated apex data`);
  },
};
