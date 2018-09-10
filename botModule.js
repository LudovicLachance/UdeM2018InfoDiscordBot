const Discord = require('discord.js');

const fs = require('fs');
const Log = require('log');
const errorlog = new Log('errorlog', fs.createWriteStream('boterror.log', { flags: 'a' }));

module.exports = (function(client, errorlog) {
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  let commands = {};

  client.on('message', msg => {
    let cmd = msg.content;
    if (cmd[0] !== '!') return;
    cmd = cmd.split(' ')[0];
    cmd = cmd.replace('!', '');
    cmd = cmd.charAt(0).toUpperCase() + cmd.slice(1);
    cmd = 'on' + cmd;

    if (cmd in commands) {
      try {
        commands[cmd](msg);
      } catch (error) {
        errorlog.info('Error in ' + cmd + ' with: ```' + msg.content + '```');
      }
    }
  });

  client.on('messageReactionAdd', (reaction, user) => {
    reaction.message.channel.send(user
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
    commands,
  };
})(new Discord.Client(), errorlog);