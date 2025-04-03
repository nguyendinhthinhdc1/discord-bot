const { Client } = require('discord.js');
const { CommandKit } = require('commandkit');

const client = new Client({
	intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'],
});

new CommandKit({
	client,
	commandsPath: `${__dirname}/commands`,
	eventsPath: `${__dirname}/events`,
	bulkRegister: true,
});

client.login(process.env.DISCORD_BOT_TOKEN);
