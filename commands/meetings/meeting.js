module.exports = {
    name: 'meeting',
    group: 'meetings',
    description: 'Schedule a meeting (.meeting DD/MM/YYYY HH:MM)',
    execute(msg, args, db) {
        let re = /([0-9]{2}[/]){2}[0-9]{4} [0-9]{2}:[0-9]{2}/
        let date = `${args[0]} ${args[1]}`
        if (!re.test(date)) return;

        db.set(`Meeting: First Reminder ${date}`, `${date}`).then(() => {});       

        msg.channel.send(`Scheduled a meeting for ${args[0]} ${args[1]}`)
    },
};