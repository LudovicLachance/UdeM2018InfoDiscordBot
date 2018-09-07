require('dotenv').config()
const Discord = require('discord.js');
const octokit = require('@octokit/rest')({
  timeout: 0, // 0 means no request timeout
  headers: {
    accept: 'application/vnd.github.v3+json',
    'user-agent': 'octokit/rest.js v1.2.3' // v1.2.3 will be current version
  }, 
  // custom GitHub Enterprise URL
  baseUrl: 'https://api.github.com', 
  // Node only: advanced request options can be passed as http(s) agent
  agent: undefined
});

octokit.authenticate({
  type: 'basic',
  username: process.env.GITHUB_USERNAME,
  password: process.env.GITHUB_PASS,
})

let botModule = (function(client) {
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  let commands = {};

  client.on('message', msg => {
    let cmd = msg.content;
    cmd = cmd.split(' ')[0];
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
    commands,
  };
})(new Discord.Client());

botModule.addCmd('onHelp', function(msg) {
  let list = Object.keys(botModule.commands);
  for (let e in list) {
    list[e] = list[e].replace('on', '!');
    list[e] = list[e].toLowerCase();
  }
  msg.channel.send('Command list:\n' + list.join('\n'));
});

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

botModule.addCmd('onGitinvite', function(msg) {
  octokit.repos.addCollaborator({
    owner: process.env.GITHUB_USERNAME,
    repo: process.env.GITHUB_REPO,
    username: msg.content.split(' ')[1]},
    (error, result) => {
      msg.channel.send(
        msg.content.split(' ')[1] + ' has been invited!'
      );
    }
  );
});

botModule.addCmd('onEvaluate', function(msg) {
  if (msg.content.includes('```')) {
    let pieces = msg.content.split('```');
    try {
      let result = eval(pieces[1]);
      msg.channel.send(
        'Result: ' + result
      );    
    } catch (error) {
      msg.channel.send(
        'Error: ' + error
      );
    }
  } else {
    let pieces = msg.content.split(' ');
    delete pieces[0];
    try {
      let result = eval(pieces.join(' '));
      msg.channel.send(
        'Result: ' + result
      );    
    } catch (error) {
      msg.channel.send(
        'Error: ' + error
      );
    }
  }
});

botModule.start();