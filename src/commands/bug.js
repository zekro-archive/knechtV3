var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');


var TYPES = [
    'CRITICAL',
    'MAJOR',
    'MINOR',
    'SUGGESTION' 
];

var COLORS = [
    0xf44336,
    0xFF7043,
    0xFFEE58,
    0x5C6BC0
];


module.exports = function(msg, args, author, channel, guild) {

    let sendHelp = () => {
        return Embeds.sendEmbedError(channel, 
            'USAGE: `bug <type> <message text>`\n' +
            '```\nTypes:\n0 - CRITICAL\n1 - MAJOR\n2 - MINOR\n3 - SUGGESTION\n```');
    }

    if (args.length < 2)
        return sendHelp();
    
    let content = args.slice(1).join(' ');
    let type = parseInt(args[0]);
    if (isNaN(type) || type > 3 || type < 0)
        return sendHelp();
    
    let bugchan = guild.channels.get(Main.config.bugtracker);
    if (!channel) {
        return Embeds.sendEmbedError(bugchan, 'Bugtracker channel not found!');
    }

    bugchan.send('', Embeds.getEmbed('')
        .setColor(COLORS[type])
        .addField('TYPE', TYPES[type], true)
        .addField('FROM', author, true)
        .addField('MESSAGE', content, false));

    return Embeds.sendEmbed(channel, `Your ${type == 3 ? 'suggestion' : 'bug report'} was submitted.`);

}