module.exports = {
  name: 'git',
  group: 'general',
  description: `${process.env.PREFIX}git \n\nReturns github repo for the bot`,
  execute(msg, args) {
    msg.channel.send('https://github.com/Matt-Mcl/DiscordBotJS');
  },
};
