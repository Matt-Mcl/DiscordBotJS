const Discord = require('discord.js');

module.exports = {
  name: 'meetings',
  group: 'meetings',
  description: '```.meetings \nList meetings```',
  async execute(msg, args, meetingData) {
    const meetings = await meetingData.find().toArray();

    let description = meetings.map(meeting => meeting.data);

    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Meetings')
      .setDescription(description);

      msg.channel.send(embed);
  },
};
