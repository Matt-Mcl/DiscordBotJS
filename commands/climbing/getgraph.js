const fetch = require('node-fetch');

module.exports = {
  name: 'getgraph',
  aliases: ['gg'],
  group: 'climbing',
  description: `${process.env.PREFIX}getgraph range [startdate] [enddate] {width,height} \n.getgraph average [day] [show] {width,height} \n\nPlot a graph using the climbing-app API. Size is optional. \n\nExamples: \n.getgraph range 01/11/2021 02/11/2021 1200,600 \n.getgraph average today 1200,600`,
  async execute(msg, args, climbingData) {

    let [width, height] = [1200, 600];
    if (args[3]) {
      const size = args[3].split(',');
      [width, height] = [size[0], size[1]];
    }

    let URL = ""

    if (args[0] === 'range') {
      URL = `${process.env.CLIMBING_API_SERVER}/getgraph?startdate=${args[1]}&enddate=${args[2]}&type=range&asimage=true,${width},${height}`
    } else if (args[0] === 'average') {
      URL = `${process.env.CLIMBING_API_SERVER}/getgraph?day=${args[1]}&show=${args[2]}&type=average&asimage=true,${width},${height}`
    } else {
      return msg.channel.send('Type must be either range or average');
    }

    const response = await fetch(URL);

    if (response.status === 400) {
      const json = await response.json();
      const error = JSON.stringify(json.error)
      return msg.channel.send(error.substring(1, error.length-1));
    }

    return msg.channel.send(URL);   
  },
};
