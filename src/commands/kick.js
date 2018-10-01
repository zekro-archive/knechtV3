const Main = require('../main');
const Embeds = require('../funcs/embeds');
const Funcs = require('../funcs/funcs');
const AcceptMessage = require('acceptmessage');
const Consts = require('../consts');


module.exports = function(msg, args, author, channel, guild) {

    if (Funcs.cmdDisallowed(msg))
        return new Promise(r => {r();});

    msg.delete();

    if (args.length < 2) {
        return Embeds.sendEmbedError(channel, 'Usage: `kick <user resolvable> <reason text>`');
    }

    let kerbholz = guild.channels.find(c => c.id == Main.config.kerbholz);

    let victim = Funcs.fetchMember(guild, args[0]);
    if (!victim) {
        return Embeds.sendEmbedError(channel, 'Invalid victim.');
    }

    let reason = '[KICK] ' + args.slice(1).join(' ');

    let msg = new AcceptMessage(Main.client, {
        content: Embeds.getEmbed('', 'Please review your kick execute')
            .addField('Victim', `${victim} (${victim.user.tag})`)
            .addField('Reason', reason),
        emotes: {
            accept: '✅',
            deny:   '❌'
        },
        checkUser: author,
        deleteMessage: true,
        actions: {
             accept: () => {
                victim.kick(reason);
                Main.mysql.query('INSERT INTO reports VALUES (?, ?, ?, ?)', [victim.id, author.id, Funcs.getTime(), reason]);
                let emb = Embeds.getEmbed('', 'KICK REPORT')
                    .setColor(Consts.COLORS.ORANGE)
                    .addField('EXECUTOR', `${author} (${author.user.tag})`, true)
                    .addField('VICTIM', `${victim} (${victim.user.tag})`, true)
                    .addField('REASON', reason, false);
                channel.send('', emb);
                kerbholz.send('', emb);
                victim.send('', emb);
             },
             deny:   () => Embeds.sendEmbedError(channel, 'Canceled.')
        }
    }).send(channel);

}