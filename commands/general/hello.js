module.exports = {
    name: 'hello',
    group: 'general',
    description: `${process.env.PREFIX}hello \n\nReplies hello to the user`,
    execute(msg, args) {
        msg.channel.send(`Hello, ${msg.author}!`)
    },
};
