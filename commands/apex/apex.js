module.exports = {
  name: 'apex',
  group: 'apex',
  description: '```.apex \nRetrieves tracked ranked stats of player```',
  async execute(msg, args, apexdb) {
    const rankScoreData = apexdb.collection('rankScoreData');
    const arenaScoreData = apexdb.collection('arenaScoreData');

    console.log(await rankScoreData.find().toArray())
    console.log(await arenaScoreData.find().toArray())

    msg.channel.send((await rankScoreData.find().toArray()).map(item => item.score));
    msg.channel.send((await arenaScoreData.find().toArray()).map(item => item.score));
  },
};
