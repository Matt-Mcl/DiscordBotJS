module.exports = {
  name: 'listdates',
  aliases: ['ld'],
  group: 'climbing',
  description: `${process.env.PREFIX}listdates \n\nList all the dates that data is stored for`,
  async execute(msg, args, climbingData) {

    function formatDate(dt) {
      return new Date(`${dt.substring(6, 10)}-${dt.substring(3, 5)}-${dt.substring(0, 2)}`);
    }

    const data = await climbingData.find().toArray()
    
    data.sort(function(a, b) {
      return formatDate(a["_id"]) - formatDate(b["_id"]);
    });

    let start = data[0]["_id"].substring(0, 10);
    let end = data[data.length - 1]["_id"].substring(0, 10);

    return msg.channel.send(`Data available between: \n${start} - ${end}.`);
  },
};
