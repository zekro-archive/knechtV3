var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');


module.exports = function(msg, args, author, channel, guild) {

    if (args.length < 2) {
        return Embeds.sendEmbedError(channel, 'Usage:\n`report <user resolvable> <reason text>`\n`report list <user resolvable>`');
    }

    if (args[0] == 'list') {
        let victim = Funcs.fetchMember(guild, args[1], false);
        let victimID = args[1];
        return new Promise((resolve, reject) => {
            Main.mysql.query('SELECT * FROM reports WHERE victim = ?', [victimID], (err, res) => {
                if (err)
                    return;
                if (res.length == 0) {
                    Embeds.sendEmbed(channel, 'This user has a white west!', `Reports for ${victim ? victim.user.tag : `QUITTED (${victimID})`}`);
                    resolve();
                    return;
                }
                let emb = Embeds.getEmbed('', `Reports for ${victim ? victim.user.tag : `QUITTED (${victimID})`}`);
                res.forEach((r, i) => {
                    let reporter = guild.members.get(r.reporter);
                    emb.addField(`Report #${i}`, 
                        `**Date:** \`${r.date}\`\n` +
                        `**Reporter:** ${reporter ? reporter : r.reporter}\n` +
                        '**Reason:**\n```' + r.reason + '```');
                });
                channel.send('', emb);
                resolve();
            });
        });
    }

    var kerbholz = guild.channels.find(c => c.id == Main.config.kerbholz);
    var victim = Funcs.fetchMember(guild, args[0], false);
    var reason = args.slice(1).join(' ');

    if (!victim) {
        return Embeds.sendEmbedError(channel, 'Invalid victim. Can not be found on server.');
    }

    return new Promise((resolve, reject) => {
        let emb = Embeds.getEmbed('', 'REPORT')
            .addField('EXECUTOR', author, true)
            .addField('VICTIM', victim, true)
            .addField('REASON', reason, false);
            
        if (kerbholz)
            kerbholz.send('', emb);  

        victim.send('', emb);
        Embeds.sendEmbed(channel, `Report of ${victim} was submitted by ${author}.\nReason:\n${reason}`);
        Main.mysql.query('INsERT INTO reports VALUES (?, ?, ?, ?)', [victim.id, author.id, Funcs.getTime(), reason]);
        resolve();
    });
}