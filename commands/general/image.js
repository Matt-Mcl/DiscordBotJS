const { MessageAttachment } = require('discord.js');
const imageSearch = require('image-search-google');
const API_KEY = process.env.GOOGLEAPIKEY;
const CSE_ID = process.env.CSEID;

module.exports = {
    name: 'image',
    group: 'general',
    description: '```.image [query] \nReturns an image related to query```',
    async execute(msg, args) {
        let query = args.join();

        const google = new imageSearch(CSE_ID, API_KEY);

        // const options = {page:1};

        let results = await google.search(query, { page:1, size:'small' });

        // console.log(results);

        if (!results) return msg.channel.send(':x: No images fdound.');

        let random = Math.floor(Math.random() * 10);
        console.log(random);

        const image = new MessageAttachment(results[random].url);

        msg.channel.send(image);

        // client.search(query, options)
        //     .then(images => {
        //         msg.channel.send(images[Math.floor(Math.random() * 10)].url);
        //     })
        //     .catch(error => console.log(error));
    },
};