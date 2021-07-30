module.exports = {
    name: 'hello',
    group: 'general',
    description: '```.hello \nReplies hello to the user```',
    execute(msg, args) {
        msg.channel.send(`Hello, ${msg.author}!`)
    },
};
