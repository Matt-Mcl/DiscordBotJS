module.exports = {
    name: 'udeshya',
    group: 'general',
    description: '```.udeshya \nfuck you```',
    execute(msg, args) {
        for (let i = 0; i < 5; i++) {
            msg.channel.send(`Udeshya is a massive degenerate! Glad we all agree 😊`)
        }
    },
};