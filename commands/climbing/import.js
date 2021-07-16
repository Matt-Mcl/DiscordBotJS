const Discord = require('discord.js');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const redisScan = require('node-redis-scan');
const fetch = require('node-fetch');

module.exports = {
    name: 'import',
    aliases: ['i'],
    group: 'climbing',
    description: '```.import [file] \n{//TODO}```',
    async execute(msg, args, redisClient) {
        const file = msg.attachments.first()?.url;
        const response = await fetch(file);
        let data = await response.text();

        data = data.split('\n');
        data.shift();
        data.pop();

        for (let entry of data) {
            let date = entry.substring(1, 21);
            let count = entry.substring(23, entry.length);

            redisClient.set(`Climbing count: ${date}`, `${count}`);
        }
    },
};
