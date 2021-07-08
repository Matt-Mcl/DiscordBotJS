module.exports = {
    name: 'help',
    group: 'help',
    description: '```.help [command] \nProvides help from provided command```',
    execute(msg, args, commands) {
        if (args.length === 0) {
            let descriptions = ['To view detailed help use .help [command]'];
            commands.forEach(command => {
                if (!command.description.includes('TODO')) {
                    descriptions.push(command.description.split(/\n/)[0], '```');
                }
            });
            msg.channel.send(`${descriptions.join("")}`);
            return
        }
        let command = commands.get(args[0]);
        msg.channel.send(`${args[0]}: ${command.description}`);
    },
};