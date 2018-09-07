require('dotenv').config()
let Discord = require('discord.js');

let botModule = (function(client) {
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  let commands = {};

  client.on('message', msg => {
    let cmd = msg.content;
    cmd = cmd.replace('!', '');
    cmd = cmd.charAt(0).toUpperCase() + cmd.slice(1);
    cmd = 'on' + cmd;

    if (cmd in commands) {
      commands[cmd](msg);
    }
  });

  client.on('messageReactionAdd', (reaction, user) => {
    reaction.message.channel.send(user.username
      + ' reacted to '
      + reaction.message.author
      + ' with '
      + reaction._emoji.name);
  });

  function addCmd(name, funct) {
    commands[name] = funct;
  }

  function start() {
    client.login(process.env.BOT_KEY);
  }

  return {
    start,
    addCmd,
  };
})(new Discord.Client());

botModule.addCmd('onPing', function(msg) {
  msg.channel.send('pong');
});

botModule.addCmd('onRoll', function(msg) {
  msg.channel.send(
    msg.author.username
    + ' has rolled '
    + (Math.floor(Math.random() * 100) + 1)
    + '!'
  );
});

botModule.start();