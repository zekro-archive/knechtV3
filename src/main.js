var discord = require('discord.js');
var MySql = require('mysql');
var { CmdParser } = require('discordjs-cmds');
var Consts = require('./consts');
var config = require('../config.json');

var client = new discord.Client();

var mysql = MySql.createConnection(config.mysql);
mysql.connect();

var cmd = new CmdParser(client, config.prefix)
    .setHost(config.host)
    .addType('DEBUG')
    .setOptions({
        msgcolor: Consts.COLORS.MAIN,
        cmdlog: true,
        msgedit: false,
        logfilepath: './logs',
        invoketolower: true,
        ownerpermlvl: 5
    });
config.permroles.forEach(pm =>
    cmd.setPerms(pm[0], pm[1]));

// REGISTER COMMAND
cmd
    // ALL COMMANDS
    .register(require('./commands/dev'), 'dev', ['devroles', 'role', 'lang'], 'Add or remove dev roles', '`dev <role1> <role2>`')
    .register(require('./commands/invite'), 'invite', ['inv', 'botinv'], 'Invite your bot to this guild', `invite <BotID> <repository URL>`)
    .register(require('./commands/notify'), 'notify', ['noty'], 'Get or remove notify role', `notify`)
    .register(require('./commands/prefix'), 'prefix', ['pre', 'präfix'], 'Set and list all bot prefixes', `prefix list\nprefix <botID> <prefix>`)
    .register(require('./commands/bug'), 'bug', ['bugreport', 'suggest'], 'Send a bug report or suggestion', `bug <type> <message text>`)
    // STAFF COMMANDS
    .register(require('./commands/report'), 'report', ['rep', 'reports'], 'Report someone', `report <user resolvable> <reason text>\nreport list <user resolvable>`, 'GUILDADMIN', 4)
    // ADMIN COMMANDS
    .register(require('./commands/restart'), 'restart', null, 'Restart the bot', `restart`, 'ADMIN', 5)
    .register(require('./commands/game'), 'game', null, 'Set game of the bot', `game reset\ngame <message>`, 'ADMIN', 5)
    // ZEKRO COMMANDS
    .register(require('./commands/test'), 'test', null, 'Only for testing purposes', null, 'DEBUG', 999)
    ;


exports.client = client;
exports.cmd = cmd;
exports.config = config;
exports.mysql = mysql;

exports.botInvites = {};
exports.changedGame = false;

// REGISTERING EVENTS
require('./events/membercount');
require('./events/ready');
require('./events/bots');

client.login(config.token);


