const ChartJsImage = require('chartjs-to-image');
const redisScan = require('node-redis-scan');

module.exports = {
    name: 'graph',
    aliases: ['g'],
    group: 'climbing',
    description: '```.graph [DD/MM/YYYY] \nGraphs a given days data```',
    async execute(msg, args, redisClient) {
        const scanner = new redisScan(redisClient);

        async function scan(query) {
            return await new Promise((resolve, reject) => {
                return scanner.scan(query, (err, matches) => {
                    resolve(matches.sort());
                });
            });
        }

        let scanQuery;

        if (args[0].match(/(today)|(t)/)) {
            let d = new Date();
            d = d.toLocaleString('en-GB', { timeZone: 'Europe/London' }).substring(0, 10);
            scanQuery = `Climbing count: ${d}*`;
        } else if (args[0].match(/(yesterday)|(y)/)) {
            let d = new Date();
            d.setDate(d.getDate() - 1)
            d = d.toLocaleString('en-GB', { timeZone: 'Europe/London' }).substring(0, 10);
            scanQuery = `Climbing count: ${d}*`;
        } else if (!args[0].match(/([0-9]{2}[/]){2}[0-9]{4}/)) {
            return msg.channel.send('Please enter a valid date'); 
        } else {       
            scanQuery = `Climbing count: ${args[0]}*`;    
        }

        let keys = await scan(scanQuery);

        let times = [];
        let counts = [];

        for (let key of keys) {
            let value = await new Promise((resolve, reject) => {
                redisClient.get(key, function(err, reply) {
                    resolve(reply);
                });
            });

            let time = key.substring(28, 33);
            times.push(time);
            counts.push(value);
        } 

        if (times.length === 0) return msg.channel.send('No data for given date'); 

        let myChart = new ChartJsImage();
        myChart.setConfig({
            type: 'line',
            data: { 
                labels: times, 
                datasets: [{ 
                    label: `Count - ${scanQuery.substring(16, 26)}`, 
                    data: counts,
                    fill: false,
                    borderColor: 'rgb(200, 0, 0)',
                    pointRadius: 0,
                } 
            ]},
        });

        myChart.setWidth(1200).setHeight(600);

        await myChart.toFile('exportchart.png');

        msg.channel.send(`Graphed data for ${scanQuery.substring(16, 26)}:`, {
            files: [
                'exportchart.png'
            ]
        });
    },
};