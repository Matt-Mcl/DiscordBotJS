const execSync = require('child_process').execSync;

module.exports = {
    name: 'backups',
    aliases: ['b'],
    group: 'general',
    description: '```.backups \nList size of backups folder on server```',
    execute(msg, args) {
        try {
            const output = execSync('du -h ../ES/backups', { encoding: 'utf-8' });
            if (output) msg.channel.send(output);
        } catch (e) {
            msg.channel.send(e.stderr);
        }
    },
};
