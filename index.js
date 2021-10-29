// Required packages
const express = require('express');
const cors = require('cors')
const Discord = require('discord.js');
const fs = require('fs');
const fetch = require('node-fetch');
const {MongoClient} = require('mongodb');
require('dotenv').config();

// Setup Mongo client
const mongoClient = new MongoClient('mongodb://127.0.0.1:27017');
mongoClient.connect().then(console.log(`MongoDB Connected`));

const climbingdb = mongoClient.db('climbingapp');
const climbingData = climbingdb.collection('climbingdata');

const meetingdb = mongoClient.db('meetingdb');
const meetingData = meetingdb.collection('meetingdata');

const apexdb = mongoClient.db('apexdb');

// Setup webserver
const app = express();
const port = 3001;
app.use(cors());

let climbingRoute = (req, res) => res.send('Loading..');

let router
function setupRouter() {
  router = new express.Router();

  router.get('/', (req, res) => res.send('Hello World!'));
  router.get('/climbing', climbingRoute);
}

app.use(function replaceableRouter (req, res, next) {
  router(req, res, next);
});
setupRouter();

app.listen(port, () => console.log(`Express server running on port: ${port}`));

// Setup Discord client
const client = new Discord.Client();
const prefix = process.env.PREFIX;

// Create collection for commands
// Read directories recursively, importing commands
client.commands = new Discord.Collection();

fs.readdir('./commands', function (err, directories) {
  directories.forEach(function (directory) {
    fs.readdir(`./commands/${directory}`, function (err, files) {
      files.forEach(function (file) {
        const command = require(`./commands/${directory}/${file}`);
        client.commands.set(command.name, command);
      });
    });
  });
});

// Display login information when bot connects
client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`)
  client.guilds.cache.forEach(server => {
    console.log("Connected to: " + server.name + ", id: " + server.id);
  });

  if (process.env.ENVIRONMENT === 'PROD') {
    const statusChannel = client.channels.cache.find(channel => channel.name === 'status');
    let date = new Date();
    let locale = date.toLocaleString('en-GB', { hour12: false, timeZone: 'Europe/London' });

    statusChannel.send(`Bot received patch at ${locale}`);
  }

  if (process.env.ENVIRONMENT === 'DEV') {
    const devChannel = client.channels.cache.find(channel => channel.name === 'dev');

    let msg = await devChannel.send('Updating data');
    
    let command = client.commands.get('updateclimbing')
    command.execute(msg, [], climbingData);

    command = client.commands.get('updateapex')
    command.execute(msg, [], apexdb);
  }
});

let commandsEnabled = true;

// Processing any incoming messages
client.on('message', msg => {
  if (!msg.content.startsWith(prefix) || msg.author.bot) return

  let inDevChannel = msg.channel.id.match('885167835012276275');

  if (process.env.ENVIRONMENT === 'DEV' && !inDevChannel) return
  if (process.env.ENVIRONMENT === 'PROD' && inDevChannel) return

  // Pause command disables commands until ran again
  if (msg.content === `${prefix}pause`) {
    commandsEnabled = !commandsEnabled;
    if (commandsEnabled) {
      msg.channel.send('Commands enabled.');
    } else {
      msg.channel.send('Commands disabled.');
    }
    return
  }

  // If commands aren't enabled, return
  if (!commandsEnabled) return

  // Special case for poll as arguments are handled differently
  if (msg.content.toLowerCase().startsWith(`${prefix}poll`)) {
    client.commands.get('poll').execute(msg);
    return
  }

  // Splits arguments by space then retrieves command name as first argument
  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Retrieves command from collection, checking for aliases
  const command = client.commands.get(commandName)
  || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  // If no command is found, return
  if (!command) return

  try {
    // If its a meetings or climbing command, pass in the database
    if (command.group === 'climbing') {
      command.execute(msg, args, climbingData);
    } else if (command.group === 'meetings') {
      command.execute(msg, args, meetingData);
    } else if (command.group === 'help') {
      command.execute(msg, args, client.commands);
    } else if (command.group === 'apex') {
      command.execute(msg, args, apexdb);
    } else {
      command.execute(msg, args);
    }
  } catch (error) {
    console.error(error);
    msg.reply('there was an error trying to execute that command!');
  }
});

// Retrieves current count of people climbing
async function getClimbingCount() {
  const response = await fetch('https://portal.rockgympro.com/portal/public/2660c1de4a602e808732f0bcd3fea712/occupancy');
  const text = await response.text();
  // Retrieves the count and capacity with a regex and removes all non-numbers
  const count = text.match(/('count' : ).+/)[0].replace(/[^0-9]/g, '');
  const capacity = text.match(/('capacity' : ).+/)[0].replace(/[^0-9]/g, '');
  return [count, capacity];
}

// Updates the climbing path every 30 seconds to have the current climbing count
client.setInterval(function() {
  (async () => {
    const [count, capacity] = await getClimbingCount();

    climbingRoute = (req, res) => res.send(`<h1>There are ${count}/${capacity} people climbing<h1>`);

    setupRouter();
  })()
}, 1000 * 30);

client.login(process.env.TOKEN);

console.log('Logging in..');
