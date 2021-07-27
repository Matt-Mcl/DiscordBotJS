const fetch = require('node-fetch');
const cheerio = require('cheerio');
const Fuse = require('fuse.js');

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

        const question = args.join(' ');
        const options = {
            isCaseSensitive: false,
            includeScore: true,
        }
        const fuse = new Fuse(Object.keys(dict), options);
    
        const results = fuse.search(question);

        console.log(results);

        if (!results) return;

        for (let result of results) {
            msg.channel.send(`- ${result.item}\n${dict[result.item]}\n------------------------`);
        }        
    },
};