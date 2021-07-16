const execSync = require('child_process').execSync;

module.exports = {
    name: 'exec',
    group: 'general',
    description: '```.exec [command] [args]\nAllows running commands in terminal```',
    execute(msg, args) {
        try {
            const output = execSync(args.join(' '), { encoding: 'utf-8' });
            if (output) msg.channel.send(output);
        } catch (e) {
            msg.channel.send(e.stderr);
        }
    },
};