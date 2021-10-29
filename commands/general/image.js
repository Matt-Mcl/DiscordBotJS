const { MessageAttachment } = require('discord.js');
const imageSearch = require('image-search-google');
const API_KEY = process.env.GOOGLEAPIKEY;
const CSE_ID = process.env.CSEID;

module.exports = {
    name: 'image',
    group: 'general',
    description: `${process.env.PREFIX}image [query] \n\nReturns an image related to query`,
    async execute(msg, args) {
        let query = args.join();

        const google = new imageSearch(CSE_ID, API_KEY);

        let results = await google.search(query, { page:1, size:'small' });

        if (!results) return msg.channel.send('No images found.');
        
        const image = new MessageAttachment(results[Math.floor(Math.random() * 10)].url);

        msg.channel.send(image);
    },
};
