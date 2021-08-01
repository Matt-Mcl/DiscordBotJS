const ChartJsImage = require('chartjs-to-image');
const redisScan = require('node-redis-scan');

module.exports = {
    name: 'graphavg',
    aliases: ['ga'],
    group: 'climbing',
    description: '```.graphavg [day] \nPlot average for given day of the week using all previous data```',
    async execute(msg, args, redisClient) {
        if (args.length === 0) return msg.channel.send('Please provide a day'); 

        const inputDay = args[0].toLowerCase();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        if (!days.includes(inputDay)) return msg.channel.send('Please provide a valid day'); 

        const scanner = new redisScan(redisClient);

        async function scan(query) {
            return await new Promise((resolve, reject) => {
                return scanner.scan(query, (err, matches) => {
                    resolve(matches.sort());
                });
            });
        }

        let keys = await scan('Climbing count: *');

        let datasets = [];

        let lastDate = null;
        let graphDate = null;
        let dataset = [];

        for (let key of keys) {
            graphDate = key.substring(16, 26);
            let date = new Date(`${graphDate.substring(6, 10)}-${graphDate.substring(3, 5)}-${graphDate.substring(0, 2)}`);
            const day = days[date.getDay()];

            if (inputDay === day) {
                if (!lastDate) lastDate = date;
                let value = await new Promise((resolve, reject) => {
                    redisClient.get(key, function(err, reply) {
                        resolve(reply);
                    });
                });

                if (date.getTime() === lastDate.getTime()) {
                    dataset.push(value);
                } else {
                    datasets.push( { data: dataset, label: graphDate } );
                    dataset = [];
                    dataset.push(value);
                } 
                lastDate = date;
            }
        }

        datasets.push( { data: dataset, label: graphDate } );

        let max = 0;

        for (let i = 1; i < datasets.length; i++) {
            if (datasets[i].data.length > datasets[max].data.length) max = i;
        }

        let times = [];
        keys = await scan(`Climbing count: ${datasets[max].label}*`);

        for (let key of keys) {
            times.push(key.substring(28, 33));
        }

        let graphData = [];

        for (let i = 0; i < datasets[max].data.length; i++) {
            let total = 0;
            for (let dataset of datasets) {
                if (dataset.data[i]) total += parseInt(dataset.data[i]);
            }
            graphData.push(Math.round(total / datasets.length));
        }

        let myChart = new ChartJsImage();
        myChart.setConfig({
            type: 'line',
            data: { 
                labels: times, 
                datasets: [{
                    label: `Average ${inputDay.charAt(0).toUpperCase() + inputDay.slice(1)}`,
                    data: graphData,
                    fill: false,
                    borderColor: 'rgb(200, 0, 0)',
                    pointRadius: 0,
                }]
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