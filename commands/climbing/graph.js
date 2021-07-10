const ChartJsImage = require('chartjs-to-image');
const redisScan = require('node-redis-scan');

module.exports = {
    name: 'graph',
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

        const re = /([0-9]{2}[/]){2}[0-9]{4}/
        if (!re.test(args[0])) return msg.channel.send('Please enter a valid date');

        let scanQuery = `Climbing count: ${args[0]}*`;     

        let keys = await scan(scanQuery);

        let dates = [];
        let counts = [];

        for (let key of keys) {
            let value = await new Promise((resolve, reject) => {
                redisClient.get(key, function(err, reply) {
                    resolve(reply);
                });
            });

            let date = key.substring(16, key.length);
            dates.push(date);
            counts.push(value);
        } 

        let myChart = new ChartJsImage();
        myChart.setConfig({
            type: 'line',
            data: { 
                labels: dates, 
                datasets: [{ 
                    label: 'Count', 
                    data: counts,
                    fill: false,
                } 
            ]},
        });

        await myChart.toFile('exportchart.png');

        msg.channel.send('Graphed data:', {
            files: [
                'exportchart.png'
            ]
        });
    },
};