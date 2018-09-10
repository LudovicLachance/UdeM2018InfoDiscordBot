require('dotenv').config();

const cmd = require('node-cmd');

const fs = require('fs');
const Log = require('log');
const evaluateLog = new Log('evaluateLog', fs.createWriteStream('evaluate.log', { flags: 'a' }));

const botModule = require('./botModule');

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
  type: 'token',
  token: process.env.GITHUB_TOKEN
});

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
  msg.channel.send(msg.author + ' has rolled ' + (Math.floor(Math.random() * 100) + 1) + '!');
});

botModule.addCmd('onGitinvite', function(msg) {
  octokit.repos.addCollaborator(
    {
      owner: process.env.GITHUB_USERNAME,
      repo: process.env.GITHUB_REPO,
      username: msg.content.split(' ')[1]
    },
    (error, result) => {}
  );
  msg.channel.send(msg.content.split(' ')[1] + ' has been invited!');
});

botModule.addCmd('onEval', function(msg) {
  if (msg.content.includes('```')) {
    let pieces = msg.content.split('```');

    evaluate(msg, pieces[1]);
  } else {
    let pieces = msg.content.split(' ');
    delete pieces[0];

    evaluate(msg, pieces.join(' '));
  }
});

botModule.addCmd('onGitupdate', function(msg) {
  msg.channel.send(msg.author + ' the bot will be updated!');
  cmd.get(
    'git checkout develop; git pull origin develop; git fetch origin develop; npm install; pm2 restart main;',
    function(err, data, stderr) {
      evaluateLog.info('```' + data + '```');
    }
  );
});

botModule.addCmd('onTest', function(msg) {
  msg.channel.send(msg.author + ' the test is working!');
});

botModule.addCmd('onRole', function(msg) {
  let pieces = msg.content.split(' ');

  if (
    !msg.member.roles.find(function(e) {
      return e.name === 'Membres';
    })
  ) {
    return;
  }

  delete pieces[0];

  let rolename = pieces.join(' ');

  if (['Modérateurs', 'Administrateur', 'Membres'].includes(rolename)) return;

  let guildrole = msg.guild.roles.find(function(e) {
    return e.name === rolename;
  });

  if (!guildrole) {
    return;
  }

  msg.member.addRole(guildrole.id);

  msg.channel.send(msg.author + ' is a ' + rolename + '!');
});

botModule.start();

function evaluate(msg, text) {
  evaluateLog.info('```' + text + '```');
  try {
    let result = eval(text);
    msg.channel.send('Result: ' + result);
  } catch (error) {
    msg.channel.send('Error: ' + error);
  }
}
