var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');


function getUserString(member) {
    return `${member} (${member.user.tag})`
}

module.exports = function(msg, args, author, channel, guild) {

    if (Funcs.cmdDisallowed(msg))
        return new Promise(r => {r();});

    return new Promise((resolve, reject) => {
        if (args.length < 2) {
            Embeds.sendEmbedError(channel,
                'Usage: ```\ninvite <BotID> <Code URL (GitHub, BitBucket...)>```')
                    .then(m => m.delete(5000));
            msg.delete();
            resolve();
            return;
        }
    
        var botID = args[0];
        var repo = args[1];
    
        var invite = { owner: author, id: Funcs.getRandomInt(1111, 9999) };
        Main.botInvites[botID] = invite;
        
        Embeds.sendEmbed(author,
            'Because bot invites needs to be acceppted manually by a administrator, it can take up to 24 hours until your bot will be accepted.\n' +
            'Please be patient and do not spam the invite!',
            'Invite Pending');
    
        var admins = guild.roles.find(r => r.id == Main.config.adminrole).members;
        admins.forEach(admin => {
            Embeds.sendEmbed(admin, 
                `[Bot Invite](https://discordapp.com/oauth2/authorize?client_id=${botID}&scope=bot)\nFrom: ${getUserString(author)}\nRepo: ${repo}`, 
                'BOT INVITE | ID: ' + invite.id)
                .then(m => {
                    m.react('❌');
                    var collector = m.createReactionCollector((reaction, user) => reaction.emoji.name == '❌' && user != Main.client.user);
                    collector.on('collect', (e) => {
                        delete Main.botInvites[botID];
                        Embeds.sendEmbedError(author, `Your bot invite got rejected by ${e.users.last()} (${e.users.last().tag}).`);
                        collector.stop();
                        admins.forEach(a => Embeds.sendEmbedError(a, `Invite (ID: \`${invite.id}\`) rejected by ${e.users.last()} (${e.users.last().tag}).`));
                    });
                });
        });
        msg.delete();
        resolve();
    });
}