const Discord = require('discord.js');

module.exports = {
    name: 'poll',
    group: 'polls',
    description: '```.poll question, option1, option2, ... \nCreates a poll using a question and options. Seperate each item by a comma. A tie vote results in a random selection between top voted options.```',

    async execute(msg) {
        const reactions = ["0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"]
        const args = msg.content.split(/, |,/);
        const question = args.shift().substring(6);
        const options = args;

        if (options.length <= 1) {
            return msg.reply('a poll needs at least 2 options.');
        } else if (options.length > 10) {
            return msg.reply('A poll cannot have more than 10 options.');
        }

        // Generate list of option emoji with option text
        let optionsList = [];
        options.forEach((option, i) => {
            optionsList.push(`${reactions[i]}  ${option}`)
        });

        let embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(question)
            .setDescription(optionsList);

        let sent = await msg.channel.send(embed)

        let voteCounts = [];

        // Add reactions for each option
        for (let i = 0; i < options.length; i++) {
            sent.react(reactions[i]);
            voteCounts[i] = 0;
        }

        // Create reaction collector with filter to reactions array
        const filter = (reaction) => {
            return reactions.includes(reaction.emoji.name);
        }
        // Collects for 30 seconds (30000 ms)
        const collector = sent.createReactionCollector(filter, { time: 30000 } ); 

        function getAllIndexes(arr, val) {
            let indexes = []
            let i = -1;
            while ((i = arr.indexOf(val, i+1)) != -1){
                indexes.push(i);
            }
            return indexes;
        }

        collector.on('collect', reaction => {
            voteCounts[reactions.indexOf(reaction.emoji.name)]++;
        });

        collector.on('remove', reaction => {
            voteCounts[reactions.indexOf(reaction.emoji.name)]--;
        });

        collector.on('end', async reaction => {
            sent.reactions.removeAll()
                .catch(e => console.error(`Failed to clear reactions: ${e}`));

            let max = await getAllIndexes(voteCounts, Math.max.apply(null, voteCounts));

            let votesList = [];

            optionsList.forEach((option, i) => {
                votesList.push(`${option} | Votes: ${voteCounts[i] - 1}`);
            });

            embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(question)
                .setDescription(votesList);

            sent.edit(embed);

            if (max.length === voteCounts.length) {
                msg.channel.send(`${question}: No one voted`);
                return
            }

            // If multiple options have the same number of votes, pick a random one
            winner = max[Math.floor(Math.random() * max.length)];
            
            msg.channel.send(`${question}: ${reactions[winner]} (${options[winner]}) wins with ${voteCounts[winner] - 1} votes(s)`);
        });
    },
};
