const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = {
    name: 'faq',
    group: 'oracle',
    description: '```.faq [question] \nReplies hello to the user```',
    async execute(msg, args) {
        let dict = {};
        const response = await fetch('https://www.oracle.com/startup/faq/');
        const text = await response.text();
        const $ = cheerio.load(text);
    
        $('li > h5').each(function (i) {
            dict[$(this).text()] = $('li > div').eq(i + 10).html();
        });

        if (!dict[args.join(' ')]) return;

        msg.channel.send(dict[args.join(' ')]);

    },
};