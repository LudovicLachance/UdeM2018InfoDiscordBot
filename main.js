require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
	var cmd = msg.content;
	switch (cmd) {
		case '!ping':
			msg.channel.send('pong');
			break;
		case '!roll':
			msg.channel.send(
				msg.author.username + ' has rolled ' + (Math.floor(Math.random() * 100) + 1) + '!'
			);
			break;
	}
});

client.on('messageReactionAdd', (reaction, user) => {
	//console.log(reaction)
	var yourChannel = client.channels.find('id', reaction.message.channel.id);
	var reactionAuthor;
	for (user of reaction.users) {
		reactionAuthor = user[1].username;
	}
	yourChannel.send(reactionAuthor + ' reacted to ' + reaction.message.author + ' with ' + reaction._emoji.name);
});

client.login(process.env.BOT_KEY);
