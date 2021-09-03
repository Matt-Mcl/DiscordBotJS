module.exports = {
  name: 'meeting',
  group: 'meetings',
  description: '```.meeting [DD/MM/YYYY HH:MM] \nSchedule a meeting```',
  execute(msg, args, meetingData) {
    let re = /([0-9]{2}[/]){2}[0-9]{4} [0-9]{2}:[0-9]{2}/
    let date = `${args[0]} ${args[1]}`
    if (!re.test(date)) return msg.channel.send(`Invalid date. Use format: [DD/MM/YYYY HH:MM]`);

    meetingData.insertOne({ data: `Meeting: First Reminder ${date}` }, (err, result) => { });

    msg.channel.send(`Scheduled a meeting for ${args[0]} ${args[1]}`)
  },
};
