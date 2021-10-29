const Discord = require('discord.js');

module.exports = {
  name: 'poll',
  group: 'polls',
  description: `${process.env.PREFIX}poll question, option1, option2, ... (poll run time) \n\nCreates a poll using a question, and options. \n\nSeperate each argument by a comma as shown. \n\nPoll run time is an optional value. Default is 30 seconds. \n\nA tie vote results in a random selection between top voted options. \n\nExmaple: .poll question, option1, option2 (30)`,

  async execute(msg) {
    const reactions = ["0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"];
    const args = msg.content.split(/, |,/);
    const question = args.shift().substring(6);
    const options = args;

    let time = options.at(-1).split(" ").at(-1);

    if (time && time.match(/\([0-9]+\)/)) {
      time = time.replace(/[\(\)]/g, '');
      options[options.length-1] = options.at(-1).split(" ").slice(0, -1).join(" ");
    } else {
      time = 30;
    }

    if (isNaN(time)) {
      return msg.reply('Poll run time must be a number in seconds');
    } else if (time > 3600) {
      return msg.reply('A poll can last for a maximum of 3600 seconds (1 hour)');
    } else if (time < 10) {
      return msg.reply('A poll can last for a minimum of 10 seconds');
    }

    if (options.length <= 1) {
      return msg.reply('A poll needs at least 2 options.');
    } else if (options.length > 10) {
      return msg.reply('A poll cannot have more than 10 options.');
    }

    // Generate list of option emoji with option text
    let optionsList = [];
    options.forEach((option, i) => {
      optionsList.push(`${reactions[i]}  ${option}`);
    });

    let embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(question)
      .setDescription(optionsList);

    let sent = await msg.channel.send(embed);

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
    // Collects for {time} seconds
    const collector = sent.createReactionCollector(filter, { time: time*1000 } ); 

    msg.channel.send(`Results in ${time} seconds`);

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

      if (max.length === voteCounts.length && voteCounts[0] === 1) {
        msg.channel.send(`${question}: No one voted`);
        return
      }

      // If multiple options have the same number of votes, pick a random one
      winner = max[Math.floor(Math.random() * max.length)];
      
      msg.channel.send(`${question}: ${reactions[winner]} (${options[winner]}) wins with ${voteCounts[winner] - 1} votes(s)`);
    });
  },
};
