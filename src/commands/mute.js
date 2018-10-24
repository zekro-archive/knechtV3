var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');
var AcceptMessage = require('acceptmessage');
var Consts = require('../consts');


exports.mutedCashe = {};


exports.exec = function(msg, args, author, channel, guild) {

    if (args.length < 1) {
        return Embeds.sendEmbedError(channel, 'Usage: \n`!mute <member resolvable> [<time (\\d{1,}[smhtw])>] <reason>`\n`!mute <member resolvable>` - to unmute\n`!mute list`');
    }

    if (args[0] == 'list' || args[0] == 'ls') {
        let emb = Embeds.getEmbed('Nobody is currently muted.', 'MUTED LIST');

        let mutedIds = Object.keys(exports.mutedCashe);
        if (mutedIds.length > 0) {
            emb.setDescription('');
            mutedIds.forEach(id => {
                let mute = exports.mutedCashe[id];
                let victim = guild.members.get(id);
                emb.addField(`${victim ? victim.user.tag : `not on guild (${id})`}`,
                             `**Victim:** ${victim ? `${victim} (${victim.user.tag})` : `not on guild (${id})`}\n` +
                             `**Executor:** ${mute.author} (${mute.author.user.tag})\n` + 
                             `**Expires in:** ${mute.time > -1 ? `${mute.time / 60000} min` : 'unlimited'}\n` +
                             `**Reason:**\n${mute.reason}`);
            });
        }

        return channel.send('', emb);
    }

    let victim = Funcs.fetchMember(guild, args[0], true);
    var kerbholz = guild.channels.find(c => c.id == Main.config.kerbholz);
    let muteRole = guild.roles.find(r => r.name == '[knecht muted]');

    if (!victim || !victim.id) {
        return Embeds.sendEmbedError(channel, 'Invalid victim resolvable!');
    }

    if (exports.mutedCashe[victim.id]) {
        delete exports.mutedCashe[victim.id];
        Main.mysql.query('DELETE FROM muted WHERE victim = ?', [victim.id]);
        victim.removeRole(muteRole);
        let emb = Embeds.getEmbed('', 'MUTE MANUAL RESET')
            .setColor(Consts.COLORS.VIOLET)
            .addField('VICTIM', `${victim} (${victim.user.tag})`, true)
            .addField('EXECUTOR', `${author} (${author.user.tag})`, true)
            .addField('INFO', 'MANUAL RESET OF MUTE.');
        kerbholz.send('', emb);
        victim.send('', emb);
        return channel.send('', emb);
    }

    let timeMatch = args[1].match(/\d{1,}[smhwd]/gm);
    let time = null;
    if (timeMatch) {
        let tstr = timeMatch[0];
        let multiplier = (function() {
            let mident = tstr.match(/[smhwd]/gm)[0];
            switch (mident) {
                case 's': return 1000;
                case 'm': return 60 * 1000;
                case 'h': return 60 * 60 * 1000;
                case 'd': return 24 * 60 * 60 * 1000;
                default:  return 7 * 24 * 60 * 60 * 1000;
            }
        })();
        time = Date.now() + parseInt(tstr) * multiplier;
    }

    let reason = time ? args.slice(2).join(' ') : args.slice(1).join(' ');
    if (reason == '')
        reason = '*undefined*'

    exports.mutedCashe[victim.id] = {
        time: (time ? time : -1),
        author,
        reason
    };

    Main.mysql.query('INSERT INTO muted VALUES (?, ?, ?, ?)', [victim.id, time ? time : -1, author.id, reason]);
    victim.addRole(muteRole);

    let emb = Embeds.getEmbed('', 'MUTE')
        .setColor(Consts.COLORS.VIOLET)
        .addField('VICTIM', `${victim} (${victim.user.tag})`, true)
        .addField('EXECUTOR', `${author} (${author.user.tag})`, true)
        .addField('DURATION', timeMatch ? timeMatch[0] : 'unlimited')
        .addField('REASON', reason);

    kerbholz.send('', emb);
    victim.send('', emb);
    return channel.send('', emb);
    
}


exports.autoUnmute = function(victim, mute, guild) {
    let kerbholz = guild.channels.find(c => c.id == Main.config.kerbholz);
    let author = mute.author;
    let muteRole = guild.roles.find(r => r.name == '[knecht muted]');

    delete exports.mutedCashe[victim.id];
    Main.mysql.query('DELETE FROM muted WHERE victim = ?', [victim.id]);
    victim.removeRole(muteRole);
    let emb = Embeds.getEmbed('', 'MUTE AUTO RESET')
        .setColor(Consts.COLORS.VIOLET)
        .addField('VICTIM', `${victim} (${victim.user.tag})`, true)
        .addField('EXECUTOR', `${author} (${author.user.tag})`, true)
        .addField('INFO', 'AUTO RESET OF MUTE AFTER SET TIMEOUT.');
    kerbholz.send('', emb);
    victim.send('', emb);
}