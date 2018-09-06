require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  let actions = {
    '!roll': onRoll,
    '!ping': onPing,
  };

  let cmd = msg.content;

  if (cmd in actions) {
    actions[cmd](msg);
  }
});

function onPing(msg) {
  msg.channel.send('pong');
}

function onRoll(msg) {
  msg.channel.send(
    msg.author.username
    + ' has rolled '
    + (Math.floor(Math.random() * 100) + 1)
    + '!'
  );
}

client.on('messageReactionAdd', (reaction, user) => {
  reaction.message.channel.send(user.username
    + ' reacted to '
    + reaction.message.author
    + ' with '
    + reaction._emoji.name);
});

client.login(process.env.BOT_KEY);
