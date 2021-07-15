module.exports = {
    name: 'meeting',
    group: 'meetings',
    description: '```.meeting [DD/MM/YYYY HH:MM] \nSchedule a meeting```',
    execute(channel, args, redisClient) {
        let re = /([0-9]{2}[/]){2}[0-9]{4} [0-9]{2}:[0-9]{2}/
        let date = `${args[0]} ${args[1]}`
        if (!re.test(date)) return;

        // db.set(`Meeting: First Reminder ${date}`, `${date}`).then(() => {});     
        redisClient.set(`Meeting: First Reminder ${date}`, `${date}`);  

        channel.send(`Scheduled a meeting for ${args[0]} ${args[1]}`)
    },
};