const createCsvWriter = require('csv-writer').createObjectCsvWriter;

module.exports = {
  name: 'export',
  aliases: ['e'],
  group: 'climbing',
  description: '```.export [DD/MM/YYYY] \nProvides file of climbing data.\nIf no date is provided, all data is given.```',
  async execute(msg, args, climbingData) {

    let graphDate = "";
    if (args.length > 0) {
      if (args[0].match(/(^today$)|(^t$)/)) {
        let d = new Date();
        graphDate = d.toLocaleString('en-GB', { timeZone: 'Europe/London' }).substring(0, 10);
      } else if (args[0].match(/(^yesterday$)|(^y$)/)) {
        let d = new Date();
        d.setDate(d.getDate() - 1);
        graphDate = d.toLocaleString('en-GB', { timeZone: 'Europe/London' }).substring(0, 10);
      } else if (!args[0].match(/^([0-9]{2}[/]){2}[0-9]{4}$/)) {
        return msg.channel.send(`${args[0]} is not a valid date`); 
      } else {
        graphDate = args[0];    
      }
    }

    const data = await climbingData.find( { _id: { $regex: graphDate }} ).toArray();

    if (data.length === 0) return msg.channel.send('No data for given date'); 

    let csvWriter = createCsvWriter({
      path: 'export.csv',
      header: [
        {id: '_id', title: 'DateTime'},
        {id: 'count', title: 'Count'}
      ]
    });

    csvWriter.writeRecords(data).then(() => {
      msg.channel.send('Exported data:', {
        files: [
          'export.csv'
        ]
      });
    });
  },
};
