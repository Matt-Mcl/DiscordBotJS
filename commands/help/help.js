module.exports = {
    name: 'help',
    group: 'help',
    description: '```.help [command] \nProvides help from provided command```',
    execute(msg, args, commands) {
        if (args.length > 0) {
            const command = commands.get(args[0])
            || commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));

            if (!command) return msg.channel.send(`Command not found, type .help for commands`);

            return msg.channel.send(`${command.name}: ${command.description}`);
        }

        let descriptions = ['To view detailed help use .help [command]'];
        for (let command of commands) {
            descriptions.push(`${command[1].description.split(/\n/)[0]} \`\`\``);
        }

        console.log(descriptions.sort());

        msg.channel.send(`${descriptions.sort().join("")}`);
    },
};
