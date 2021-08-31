const ChartJsImage = require('chartjs-to-image');
const redisScan = require('node-redis-scan');

module.exports = {
    name: 'graphavg',
    aliases: ['ga'],
    group: 'climbing',
    description: '```.graphavg [day] {show} \nPlot average for given day of the week using all previous data. \nOptional showAll argument plots the days that make up the average```',
    async execute(msg, args, redisClient, climbingData) {
        if (args.length === 0) return msg.channel.send('Please provide a day'); 
        if (args[1] && !args[1].match(/(^show$)|(^s$)/)) return msg.channel.send(`Please type 'show' or 's' if you want to see individual days, otherwise leave blank`);  

        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        if (args[0].match(/(^today$)|(^t$)/)) {
            const day = new Date();
            args[0] = days[day.getDay()];
        } else if (args[0].match(/(^yesterday$)|(^y$)/)) {
            let day = new Date();
            day.setDate(day.getDate() - 1);
            args[0] = days[day.getDay()];
        }

        const inputDay = args[0].toLowerCase();
    
        if (!days.includes(inputDay)) return msg.channel.send('Please provide a valid day'); 

        const scanner = new redisScan(redisClient);

        function formatDatetime(dt) {
            return new Date(`${dt.substring(6, 10)}-${dt.substring(3, 5)}-${dt.substring(0, 2)}T${dt.substring(12)}`);
        }

        async function scan(query) {
            return await new Promise((resolve, reject) => {
                return scanner.scan(query, (err, matches) => {
                    resolve(matches.sort(function(a, b) {
                        return formatDatetime(a.substring(16)) - formatDatetime(b.substring(16));
                    }));
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
                    datasets.push( { data: dataset, label: lastDate } );
                    dataset = [];
                    dataset.push(value);
                } 
                lastDate = date;
            }
        }

        datasets.push( { data: dataset, label: lastDate } );
        
        let max = 0;

        for (let i = 1; i < datasets.length; i++) {
            if (datasets[i].data.length > datasets[max].data.length) max = i;
        }

        let times = [];
        keys = await scan(`Climbing count: ${datasets[max].label.toLocaleString('en-GB', { timeZone: 'Europe/London' }).substring(0, 10)}*`);

        for (let key of keys) {
            times.push(key.substring(28, 33));
        }

        let graphData = [];

        for (let i = 0; i < datasets[max].data.length; i++) {
            let total = 0;
            let count = 0;
            for (let dataset of datasets) {
                if (dataset.data[i]) {
                    total += parseInt(dataset.data[i]);
                    count ++;
                }
            }
            graphData.push(Math.round(total / count));
        }

        let graphSets = [];

        graphSets.push({
            label: `Average ${inputDay.charAt(0).toUpperCase() + inputDay.slice(1)}`,
            data: graphData,
            fill: false,
            borderColor: 'rgb(200, 0, 0)',
            pointRadius: 0,
        })
        
        if (args[1]) {
            for (let i = 0; i < datasets.length; i++) {
                graphSets.push({
                    label: datasets[i].label.toLocaleString('en-GB', { timeZone: 'Europe/London' }).substring(0, 10),
                    data: datasets[i].data,
                    fill: false,
                    borderColor: `rgb(${i*40}, ${i*40}, ${i*40})`,
                    pointRadius: 0,
                });
            }
        }

        let myChart = new ChartJsImage();
        myChart.setConfig({
            type: 'line',
            data: { 
                labels: times, 
                datasets: graphSets,
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
