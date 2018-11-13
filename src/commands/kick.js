var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');
var AcceptMessage = require('acceptmessage');
var Snowflake = require('../funcs/snowflake');
var Consts = require('../consts');


module.exports = function(msg, args, author, channel, guild) {

    if (Funcs.cmdDisallowed(msg))
        return new Promise(r => {r();});

    msg.delete();

    if (args.length < 2) {
        return Embeds.sendEmbedError(channel, 'Usage: `kick <user resolvable> <reason text>`');
    }

    var kerbholz = guild.channels.find(c => c.id == Main.config.kerbholz);

    var victim = Funcs.fetchMember(guild, args[0]);
    if (!victim) {
        return Embeds.sendEmbedError(channel, 'Invalid victim.');
    }

    var reason = args.slice(1).join(' ');
    var type = 'KICK';

    var node = new Snowflake.Node(Consts.SNOWFLAKE_NODES.REPORTS);
    var uid = node.next();

    var msg = new AcceptMessage(Main.client, {
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
                Main.mysql.query(
                    'INSERT INTO reports VALUES (?, ?, ?, ?, ?, ?)', 
                    [uid, victim.id, author.id, Funcs.getTime(), reason, type]
                );
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