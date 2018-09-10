require('dotenv').config();

const cmd = require('node-cmd');

const fs = require('fs');
const Log = require('log');
const evaluateLog = new Log('evaluateLog', fs.createWriteStream('evaluate.log', { flags: 'a' }));
const gitupdateLog = new Log('gitupdateLog', fs.createWriteStream('gitupdate.log', { flags: 'a' }));

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

// botModule.addCmd('onGitinvite', function(msg) {
//   octokit.repos.addCollaborator(
//     {
//       owner: process.env.GITHUB_USERNAME,
//       repo: process.env.GITHUB_REPO,
//       username: msg.content.split(' ')[1]
//     },
//     (error, result) => {}
//   );
//   msg.channel.send(msg.content.split(' ')[1] + ' has been invited!');
// });

botModule.addCmd('onEval', function(msg) {
  evaluate(msg, getPara(msg.content));
});

botModule.addCmd('onGitupdate', function(msg) {
  msg.channel.send(msg.author + ' the bot will be updated!');
  cmd.get(
    'git checkout develop; git pull origin develop; git fetch origin develop; npm install; pm2 restart main;',
    function(err, data, stderr) {
      gitupdateLog.error('err:\n```' + err + '```');
      gitupdateLog.info('data:\n```' + data + '```');
      gitupdateLog.error('stderr:\n```' + stderr + '```');
    }
  );
});

botModule.addCmd('onTest', function(msg) {
  msg.channel.send(msg.author + ' the test is working!');
});

botModule.addCmd('onRolelist', function(msg) {
  let roles = msg.guild.roles.filter(function(e) {
    return e.name !== '@everyone';
  })
  let list = roles.map(function(e) { return e.name; });
  list = list.join('\n');
  msg.channel.send(msg.author + ' Rolelist:\n' + list);
});

botModule.addCmd('onRole', function(msg) {
  if (
    !msg.member.roles.find(function(e) {
      return e.name === 'Membres';
    })
  ) {
    return;
  }

  let rolename = getPara(msg.content);

  if (['Modérateurs', 'Administrateur', 'Membres'].includes(rolename)) return;

  let guildrole = msg.guild.roles.find(function(e) {
    return e.name === rolename;
  });

  if (!guildrole) {
    return;
  }

  msg.member.addRole(guildrole.id);

  msg.channel.send(msg.author + ' is now in ' + rolename + '!');
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

function getPara(str) {
  let pieces = [];
  let para = '';

  if (str.includes('```')) {
    pieces = str.split('```');
    para = pieces[1].trim();

  } else if (str.includes(' ')) {
    pieces = str.split(' ');
    delete pieces[0];
    para = pieces.join(' ').trim();
  }

  return para;
}
