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
        msgedit: true,
        logfilepath: './logs',
        invoketolower: true,
        ownerpermlvl: 5
    });
config.permroles.forEach(pm =>
    cmd.setPerms(pm[0], pm[1]));

// REGISTER COMMAND
cmd
    .register(require('./commands/dev'), 'dev', ['devroles', 'role', 'lang'], 'Add or remove dev roles', '`dev <role1> <role2>`')
    .register(require('./commands/invite'), 'invite', ['inv', 'botinv'], 'Invite your bot to this guild', `invite <BotID> <repository URL>`)
    .register(require('./commands/notify'), 'notify', ['noty'], 'Get or remove notify role', `notify`)
    .register(require('./commands/report'), 'report', ['rep'], 'Report someone', `report <user resolvable> <reason text>`, 'GUILDADMIN', 3)
    .register(require('./commands/test'), 'test', null, 'Only for testing purposes', null, 'DEBUG', 5)
    ;


exports.client = client
exports.cmd = cmd
exports.config = config
exports.mysql = mysql
exports.botInvites = {}

// REGISTERING EVENTS
require('./events/membercount');
require('./events/ready');
require('./events/bots');

client.login(config.token);


