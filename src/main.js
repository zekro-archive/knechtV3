var discord = require('discord.js');
var MySql = require('mysql');
var { CmdParser } = require('discordjs-cmds');
var Consts = require('./consts');
var WebSocket = require('./ws/ws');
var Funcs = require('./funcs/funcs');

exports.DEBUGMODE = process.argv.includes('--debug');

var config = require(exports.DEBUGMODE ? '../config_example.json' : '../config.json');
exports.config = config;

var client = new discord.Client({
    fetchAllMembers: true
});

var mysql = MySql.createConnection(config.mysql);
mysql.connect();

var ws = new WebSocket(config.webinterface.pw, (process.argv.includes('--1337') ? 1337 : 8778), client);

var cmd = new CmdParser(client, config.prefix)
    .setHost(config.host)
    .addType('STAFF')
    .addType('BOTOWNER')
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
    .register(
        require('./commands/dev'), 
        'dev', 
        ['devroles', 'role', 'lang'], 
        'Add or remove dev roles', 
        '`dev <role1> <role2>`'
    )
    .register(
        require('./commands/invite'), 
        'invite', 
        ['inv', 'botinv'], 
        'Invite your bot to this guild', 
        `invite <BotID> <repository URL>`
    )
    .register(
        require('./commands/notify'), 
        'notify', 
        ['noty', 'notification'], 
        'Get or remove notify role', 
        `notify`
    )
    .register(
        require('./commands/prefix'), 
        'prefix', 
        ['pre', 'präfix', 'pres'], 
        'Set and list all bot prefixes', 
        `prefix list\nprefix <botID> <prefix>`
    )
    .register(
        require('./commands/bug'), 
        'bug', 
        ['bugreport', 'suggest'], 
        'Send a bug report or suggestion', 
        `bug <type> <message text>`
    )
    .register(
        require('./commands/bot'), 
        'bot', 
        ['bots', 'botlist'], 
        'Get information about a bot, list all bots or get users bots', 
        `bots list\nbot <user/bot resolvable>`
    )
    .register(
        require('./commands/organization'), 
        'org', 
        ['organization', 'orginvite', 'orga'], 
        'You want to join the guilds GitHub [organziation](https://github.com/orgs/Dark-Devs)?', 
        `org <github username / URL>`
    )
    .register(
        require('./commands/exec'), 
        'exec', 
        ['exec', 'code'], 
        'Exec some code', 
        `exec -l <language> <code>`
    )
    .register(
        require('./commands/info'), 
        'info', 
        ['about', 'credits'], 
        'Get information about Knecht V3', 
        `info`
    )
    .register(
        require('./commands/topic'), 
        'topic', 
        ['forum', 'theme', 'channel', 'chan'], 
        'Create or manage a topic channel', 
        `topic <name>\ntopic delete`
    )

    // BOT OWNER COMMANDS
    .register(
        require('./commands/apitoken'), 
        'apitoken', 
        [], 
        'Get API auth token fpr knechtV3 API', 
        `apitoken <bot resolvable>`,
        'BOTOWNER',
        1
    )

    // STAFF COMMANDS
    .register(
        require('./commands/report'), 
        'report', 
        ['rep', 'reports'], 
        'Report someone', 
        `report <user resolvable> <reason text>\nreport list <user resolvable>`, 
        'STAFF', 
        4
    )
    .register(
        require('./commands/link'), 
        'link', 
        ['setbot', 'setowner', 'combine'], 
        'Link a bot together with its woner', 
        `link <bot resolvable> <user resolvable>`, 
        'STAFF', 
        4
    )
    .register(
        require('./commands/tags'), 
        'tag', 
        ['t', 'tags'], 
        'Create tags with content which can be send to channels', 
        `tags\n` +
        `tag create <name> <content>\n` +
        `tag remove <name> <content>\n` +
        `t <name>`, 
        'STAFF', 
        4
    )
    // DEPRECATED
    // .register(
    //     require('./commands/reloaddevroles'), 
    //     'reloaddev', 
    //     ['reloaddevroles', 'refreshdev'], 
    //     'Create role + channel for new dev role or delete if removed', 
    //     null, 
    //     'STAFF', 
    //     4
    // )
    .register(
        require('./commands/kick'), 
        'kick', 
        ['kickmember'], 
        'Kick someone from the guild with entry in DB + kerbholz channel', 
        `kick <member resolvable> <reason>`,
        'STAFF',
        4
    )
    .register(
        require('./commands/mute').exec, 
        'mute', 
        ['mutemember'], 
        'Mute someone with a reason optionally for a given time', 
        `!mute <member resolvable> [<time (\\d{1,}[smhtw])>] <reason>\n!mute <member resolvable> - to unmute\n!mute list`,
        'STAFF',
        4
    )
    .register(
        require('./commands/pingtoggle'), 
        'ment', 
        ['mention', 'pingtoggle', 'pt'], 
        'Manage mentionable roles', 
        `!ment\n!ment <roleResolvable>`,
        'STAFF',
        4
    )

    // ADMIN COMMANDS
    .register(
        require('./commands/restart'), 
        'restart', 
        ['reboot', 'reset'], 
        'Restart the bot', 
        `restart`, 
        'ADMIN', 
        5
    )
    .register(
        require('./commands/game'), 
        'game', 
        ['message', 'nowplaying', 'playing', 'botmsg'], 
        'Set game of the bot', 
        `game reset\ngame <message>`, 
        'ADMIN', 
        5
    )
    .register(
        require('./commands/eval'), 
        'eval', 
        [], 
        'Eval javascript code with the bot', 
        `eval\neval <javascript code>`, 
        'ADMIN', 
        5
    )
    .register(
        require('./commands/ban'), 
        'ban', 
        ['banmember'], 
        'ban someone from the guild with entry in DB + kerbholz channel', 
        `ban <member resolvable> <reason>`,
        'ADMIN',
        5
    )
    
    // ZEKRO COMMANDS
    .register(
        require('./commands/test'), 
        'thiscmdwillfuckupeverythingpleaseonlyuseifyoureallyknowwhatyouaredoing', 
        [], 
        'Only for testing purposes', 
        null, 
        'DEBUG', 
        999
    )
    ;


cmd.createDocs('./cmdlist.md', 'md');

exports.client = client;
exports.cmd = cmd;
exports.mysql = mysql;

exports.botInvites = {};
exports.changedGame = false;

if (exports.DEBUGMODE)
    Funcs.checkDevRolesRecources();

// REGISTERING EVENTS
require('./events/membercount');
require('./events/ready');
require('./events/bots');
require('./events/newchannel');
require('./events/dm');
// require('./events/chanselectcreator');

client.login(exports.DEBUGMODE ? process.argv[3] : config.token);