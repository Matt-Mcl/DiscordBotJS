const ChartJsImage = require('chartjs-to-image');
const redisScan = require('node-redis-scan');

module.exports = {
    name: 'graph',
    aliases: ['g'],
    group: 'climbing',
    description: '```.graph [DD/MM/YYYY] \nGraphs a given days data. \nUp to 3 dates can be provided and plotted on the same graph```',
    async execute(msg, args, redisClient) {
        if (args.length === 0) return msg.channel.send('Please provide a date'); 
        if (args.length > 3) return msg.channel.send('Too many dates provided'); 

        const borderColours = ['rgb(200, 0, 0)', 'rgb(0, 200, 0)', 'rgb(0, 0, 200)'];
        const scanner = new redisScan(redisClient);

        async function scan(query) {
            return await new Promise((resolve, reject) => {
                return scanner.scan(query, (err, matches) => {
                    resolve(matches.sort());
                });
            });
        }

        let datasets = [];

        for (let i = 0; i < args.length; i++) {
            let scanQuery;
            if (args[i].match(/(today)|(t)/)) {
                let d = new Date();
                d = d.toLocaleString('en-GB', { timeZone: 'Europe/London' }).substring(0, 10);
                scanQuery = `Climbing count: ${d}*`;
            } else if (args[i].match(/(yesterday)|(y)/)) {
                let d = new Date();
                d.setDate(d.getDate() - 1)
                d = d.toLocaleString('en-GB', { timeZone: 'Europe/London' }).substring(0, 10);
                scanQuery = `Climbing count: ${d}*`;
            } else if (!args[i].match(/([0-9]{2}[/]){2}[0-9]{4}/)) {
                return msg.channel.send(`${args[i]} is not a valid date`); 
            } else {       
                scanQuery = `Climbing count: ${args[i]}*`;    
            }

            let keys = await scan(scanQuery);

            if (keys.length === 0) return msg.channel.send(`No data for ${args[i]}`); 

            let counts = [];
    
            for (let key of keys) {
                let value = await new Promise((resolve, reject) => {
                    redisClient.get(key, function(err, reply) {
                        resolve(reply);
                    });
                });
                counts.push(value);
            }

            datasets.push(
                {
                    label: scanQuery.substring(16, 26),
                    data: counts,
                    fill: false,
                    borderColor: borderColours[i],
                    pointRadius: 0,
                }
            );
        }

        let max = 0;

        for (let i = 1; i < datasets.length; i++) {
            if (datasets[i].data.length > datasets[max].data.length) {
                max = i;
            }
        }

        let times = [];
        let keys = await scan(`Climbing count: ${datasets[max].label}*`);

        for (let key of keys) {
            times.push(key.substring(28, 33));
        }

        let myChart = new ChartJsImage();
        myChart.setConfig({
            type: 'line',
            data: { 
                labels: times, 
                datasets: datasets,
            },
        });

        myChart.setWidth(1200).setHeight(600);

        await myChart.toFile('exportchart.png');

        msg.channel.send(`Graphed data:`, {
            files: [
                'exportchart.png'
            ]
        });
    },
};