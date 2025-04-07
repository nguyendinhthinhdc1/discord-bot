require('dotenv').config();

const { Client } = require('discord.js');
const { CommandKit } = require('commandkit');
const { initAutoPoll } = require('./scheduler/auto-poll');

const client = new Client({
	intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'],
});

new CommandKit({
	client,
	commandsPath: `${__dirname}/commands`,
	eventsPath: `${__dirname}/events`,
	bulkRegister: true,
});

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
	initAutoPoll(client);
});

client.login(process.env.DISCORD_BOT_TOKEN);
