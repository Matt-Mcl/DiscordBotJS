module.exports = {
  name: 'cleardata',
  group: 'climbing',
  description: `${process.env.PREFIX}cleardata \n\nClears all stored climbing data\n\n{Only enabled in development environment}`,
  async execute(msg, args, climbingData) {
    return false;

    if (process.env.ENVIRONMENT === 'PROD') return msg.channel.send('This command cannot be used in production');
    
    // await climbingData.deleteMany({});
    
    msg.channel.send('Cleared all data');
  },
};
