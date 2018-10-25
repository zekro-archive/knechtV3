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
    
        var adminlog = guild.channels.get(Main.config.adminlog)
        if (!adminlog)
            return;

        adminlog.send('@here').then((m) => m.delete(10));
        
        Embeds.sendEmbed(adminlog, 
            `[Bot Invite](https://discordapp.com/oauth2/authorize?client_id=${botID}&scope=bot)\n` +
            `From: ${getUserString(author)}\nRepo: ${repo}`, 
            'BOT INVITE | ID: ' + invite.id)
            .then(m => {
                m.react('❌');
                m.react('✅');
                var collectorReject = m.createReactionCollector((reaction, user) => reaction.emoji.name == '❌' && user != Main.client.user);
                var collectorAccept = m.createReactionCollector((reaction, user) => reaction.emoji.name == '✅' && user != Main.client.user);
                collectorReject.on('collect', (e) => {
                    delete Main.botInvites[botID];
                    let reactor = e.users.last();
                    Embeds.sendEmbed(adminlog, 'Enter a rejection reason:');
                    m.clearReactions();
                    collectorReject.stop();

                    let reasonCollector = adminlog.createMessageCollector(
                        (m) => m.author.id == reactor.id,
                        { time: 2 * 60000, maxMatches: 1 }
                    )
                    let reason = '*no reason set*';
                    reasonCollector.on('collect', (m) => {
                        reason = m.content;
                    })
                    reasonCollector.on('end', () => {
                        Embeds.sendEmbedError(author, `Your bot invite got rejected by ${reactor} (${reactor.tag}).\n\n**Reason:**\n${reason}`);
                        Embeds.sendEmbedError(adminlog, `Invite (ID: \`${invite.id}\`) rejected by ${reactor} (${reactor.tag}).\n\n**Reason:**\n${reason}`);
                    });
                });
                collectorAccept.on('collect', (e) => {
                    let reactor = e.users.last();
                    Embeds.sendEmbed(adminlog, `Invite (ID: \`${invite.id}\`) accepted by ${reactor} (${reactor.tag}).`);
                    m.clearReactions()
                })
            });
        msg.delete();
        resolve();
    });
}