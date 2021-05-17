const Discord = require('discord.js');
const fs = require('fs');

const Database = require("@replit/database")
const db = new Database()

require('dotenv').config();

const client = new Discord.Client()

const prefix = process.env.PREFIX

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

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
});

client.on('message', msg => {
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;

    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return;

    if (client.commands.get(command).group === 'general') {
        try {
            client.commands.get(command).execute(msg, args);
        } catch (error) {
            console.error(error);
            msg.reply('there was an error trying to execute that command!');
        }
    } else if (client.commands.get(command).group === 'meetings') {
        try {
            client.commands.get(command).execute(msg, args, db);
        } catch (error) {
            console.error(error);
            msg.reply('there was an error trying to execute that command!');
        }
    }
});

client.login(process.env.TOKEN)

