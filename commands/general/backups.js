const execSync = require('child_process').execSync;

module.exports = {
    name: 'backups',
    aliases: ['b'],
    group: 'general',
    description: '```.backups \nList size of backups folder on server```',
    execute(msg, args) {
        try {
            let output = execSync('du -h ../ES/backups ; ls ../ES/backups | wc -l', { encoding: 'utf-8' });
            if (output) {
                output = output.split(/[\t\n]/);
                msg.channel.send(`${output[2]} backups taking up: ${output[0]}`);
            }
        } catch (e) {
            msg.channel.send(e.stderr);
        }
    },
};
