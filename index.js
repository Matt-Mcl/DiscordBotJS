// Required packages
const express = require('express');
const cors = require('cors')
const redis = require('redis');
const Discord = require('discord.js');
const fs = require('fs');
const fetch = require('node-fetch');
require('dotenv').config();

// Setup webserver
const app = express();
const port = 3000;
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

// Setup Redis client
const redisClient = redis.createClient();

redisClient.on('connect', function () {
    console.log('Redis client connected');
});

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
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.guilds.cache.forEach(server => {
        console.log("Connected to: " + server.name + ", id: " + server.id);
    });
    outputGraph();
    saveClimbing();

    if (process.env.ENVIRONMENT === 'PROD') {
        const statusChannel = client.channels.cache.find(channel => channel.name === 'status');
        let date = new Date();
        let locale = date.toLocaleString('en-GB', { hour12: false, timeZone: 'Europe/London' });

        statusChannel.send(`Bot received patch at ${locale}`);
    }
});

let commandsEnabled = true;

// Processing any incoming messages
client.on('message', msg => {
    if (!msg.content.startsWith(prefix) || msg.author.bot) return

    // Pause command disables commands until ran again
    if (msg.content === `${prefix}pause`) {
        switch(commandsEnabled) {
            case true:
                commandsEnabled = false;
                msg.channel.send('Commands disabled.');
                break;
            case false:
                commandsEnabled = true;
                msg.channel.send('Commands enabled.');
                break;
        }
        return
    }

    // If command aren't enabled, return
    if (!commandsEnabled) return

    // Special case for poll as arguments are handled differently
    if (msg.content.toLowerCase().startsWith(`${prefix}poll`)) {
        client.commands.get('poll').execute(msg);
        return
    }

    // Splits arguments by space then retrieves command as first argument
    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Retrieves command from collection, checking for aliases
    const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // If no command is found, return
    if (!command) return

    try {
        // If its a meetings or climbing command, pass in the database
        if (command.group.match(/(meetings)|(climbing)/)) {
            command.execute(msg, args, redisClient);
        } else if (command.group === 'help') {
            command.execute(msg, args, client.commands);
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
    const response = await fetch('https://portal.rockgympro.com/portal/public/2660c1de4a602e808732f0bcd3fea712/occupancy?&iframeid=occupancyCounter&fId=');
    const text = await response.text();
    const count = text.match(/('count' : ).{1,2}/)[0].substring(10,12);
    if (count.substring(count.length - 1) === ',') {
        return count.charAt(0);
    }
    return count;
}

// Updates the climbing path every 30 seconds to have the current climbing count
client.setInterval(function() {
    (async () => {
        let count = await getClimbingCount();

        climbingRoute = (req, res) => res.send(`<h1>There are ${count}/85 people climbing<h1>`);

        setupRouter();
    })()
}, 1000 * 30);

// Retrieves components of the current date and time
function getDateTime() {
    let date = new Date();
    let locale = date.toLocaleString('en-GB', { hour12: false, timeZone: 'Europe/London' });

    let hours = locale.slice(-8).substring(0, 2);
    let minutes = locale.slice(-5).substring(0, 2);

    return [date, locale, hours, minutes]
}

// The below functions are called once the bot is connected to Discord

// Saves climbing data to database every 5 minutes
async function saveClimbing() {
    let count = await getClimbingCount();

    let [date, locale, hours, minutes] = getDateTime();

    let timeoutMinutes = 5 - (date.getMinutes() % 5);
    setTimeout(saveClimbing, timeoutMinutes * 60 * 1000);

    if (date.getMinutes() % 5 === 0 && (!(hours >= 22 || hours <= 9) || (hours == 22 && minutes < 5))) {
        console.log(`Logged [Climbing count: ${locale} | ${count}]`);
        redisClient.set(`Climbing count: ${locale}`, `${count}`);
    }
}

// Displays the graph for the current days climbing data every 30 minutes.
async function outputGraph() {
    let channelName = 'graphs';
    if (process.env.ENVIRONMENT === 'DEV') channelName = 'graphs-dev';

    let [date, locale, hours, minutes] = getDateTime();

    let timeoutMinutes = 30 - (date.getMinutes() % 30);
    setTimeout(outputGraph, timeoutMinutes * 60 * 1000);

    if (date.getMinutes() % 30 === 0 && (!(hours >= 22 || hours <= 9) || (hours == 22 && minutes < 5))) {
        const graphsChannel = client.channels.cache.find(channel => channel.name === channelName);
        let count = await getClimbingCount();

        let msg = await graphsChannel.send(`There are ${count}/85 people climbing`);

        let command = client.commands.get('graph');
        await command.execute(msg, ['t'], redisClient);
    }
}

client.login(process.env.TOKEN);

console.log('Logging in..');
