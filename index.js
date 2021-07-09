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
app.use(cors())

let climbingRoute = (req, res) => res.send('Loading..');

let router
function setupRouter() {
    router = new express.Router()

    router.get('/', (req, res) => res.send('Hello World!'));
    router.get('/climbing', climbingRoute);
}

app.use(function replaceableRouter (req, res, next) {
    router(req, res, next)
});
setupRouter();

app.listen(port, () => console.log(`Express server running on localhost:${port}`));

// Setup Redis client
const redisClient = redis.createClient();

redisClient.on('connect', function () {
    console.log('Redis client connected');
});

// Setup Discord client
const client = new Discord.Client()
const prefix = process.env.PREFIX

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

// Display login information when bot connected
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.guilds.cache.forEach(server => {
        console.log("Connected to: " + server.name + ", id: " + server.id);
    });
});

// Main command handler
let commandsEnabled = true;

client.on('message', msg => {
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;

    if (msg.content === '.pause') {
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

    if (!commandsEnabled) {
        // msg.reply('Commands are currently disabled.');
        return
    }

    // Special case for poll as arguments are handled differently
    if (msg.content.toLowerCase().startsWith(`${prefix}poll`)) {
        client.commands.get('poll').execute(msg);
        return
    }

    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return;

    try {
        // If its a meetings or climbing command, pass in the database
        if (/(meetings)|(climbing)/.test(client.commands.get(command).group)) {
            client.commands.get(command).execute(msg, args, redisClient);
        } else if (client.commands.get(command).group === 'help') {
            client.commands.get(command).execute(msg, args, client.commands);
        } else {
            client.commands.get(command).execute(msg, args);
        }
    } catch (error) {
        console.error(error);
        msg.reply('there was an error trying to execute that command!');
    }
});

async function getClimbingCount() {
    const response = await fetch('https://portal.rockgympro.com/portal/public/2660c1de4a602e808732f0bcd3fea712/occupancy?&iframeid=occupancyCounter&fId=');
    const text = await response.text();
    const count = text.match(/('count' : ).{1,2}/)[0].substring(10,12);
    if (count.substring(count.length - 1) === ',') {
        return count.charAt(0);
    }
    return count;
}

client.setInterval(function() {
    (async () => {
        let count = await getClimbingCount();

        climbingRoute = (req, res) => res.send(`<h1>There are ${count}/85 people climbing<h1>`);

        setupRouter();
    })()
}, 1000 * 30);

function saveClimbing() {
    let count;
    (async () => {
        count = await getClimbingCount();

        let d = new Date();
        let key = d.toLocaleString('en-GB', { hour12: false, timeZone: 'Europe/London' });

        let hour = key.slice(-8).substring(0, 2);

        let timeoutMinutes = 5 - (d.getMinutes() % 5);
        setTimeout(saveClimbing, timeoutMinutes * 60 * 1000);

        if (d.getMinutes() % 5 === 0 && !(hour >= 22 || hour <= 9)) {
            console.log(`Logged [Climbing count: ${key} | ${count}]`);
            redisClient.set(`Climbing count: ${key}`, `${count}`);
        }
    })()
}
saveClimbing();

client.login(process.env.TOKEN);

console.log('Logging in..');

