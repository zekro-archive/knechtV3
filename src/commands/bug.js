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



// var Main = require('../main');
// var Embeds = require('../funcs/embeds');
// var Funcs = require('../funcs/funcs');
// var AcceptMessage = require('acceptmessage');
// var Request = require('request');


// var TYPES = [
//     'CRITICAL',
//     'MAJOR',
//     'MINOR',
//     'SUGGESTION' 
// ];


// module.exports = function(msg, args, author, channel, guild) {

//     if (Funcs.cmdDisallowed(msg))
//         return new Promise(r => {r();});

//     let sendHelp = () => {
//         return Embeds.sendEmbedError(channel, 
//             'USAGE: ```\n!bug \n[TITLE IN THIS LINE]\n[TYPE (SEE BELOW) IN THIS LINE]\n[DESCRIPTION IN NEXT LINES]\n```\n\n' +
//             '**ATTENTION:** After `!bug` needs to be a [SPACE] before next line!\n\n' +
//             'Types:\n0 - CRITICAL\n1 - MAJOR\n2 - MINOR\n3 - SUGGESTION');
//     }

//     if (args.length < 2)
//         return sendHelp();

//     let lines = args.join(' ').split('\n').slice(1).map(l => l.trim());

//     if (lines.length < 3)
//         return sendHelp();

//     let title = lines[0];
//     let type = parseInt(lines[1]);
//     if (isNaN(type) || type > 3 || type < 0)
//         return sendHelp();
//     let message = lines.slice(2).join('\n');

//     let finalMsg = 
//         `## Submitted by\n` + 
//         `> ${author.user.tag}\n\n` +
//         `## Type\n` +
//         `> ${TYPES[type]}\n\n` +
//         `## Description\n` +
//         message;

//     var accmsg = new AcceptMessage(Main.client, {
//         content: Embeds.getEmbed(
//             'Your issue will look like following:\n___________________\n\n' +
//             'Title: ```\n' + title + '\n```\n' + 
//             'Type: ```\n' + TYPES[type] + '\n```\n' +
//             'Message: ```\n' + message + '\n```\n' + 
//             'Press ✅ to send the report or press ❌ to cancel.'),
//         channel: channel,
//         checkUser: author,
//         emotes: {
//             accept: '✅',
//             deny:   '❌'
//         },
//         actions: {
//             accept: () => {
//                 var options = {
//                     uri: `https://api.github.com/repos/zekroTJA/knechtV3/issues`,
//                     method: 'POST',
//                     headers: {
//                         'Authorization': `token ${Main.config.githubtoken}`,
//                         'Content-Type': 'application/json',
//                         'User-Agent': 'zekroTJA'
//                     },
//                     body: JSON.stringify({
//                         title,
//                         body: finalMsg,
//                         //labels: [ TYPES[type] ]
//                     })
//                 };
//                 Request(options, (err, res) => {
//                     console.log(err, res.body);
//                 });
//                 Embeds.sendEmbed(channel, 'Send.');
//             },
//             deny: () => {
//                 Embeds.sendEmbedError(channel, 'Canceled.');
//             }
//         }
//     });

//     accmsg.send();

// }