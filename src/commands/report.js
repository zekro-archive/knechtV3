var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');


module.exports = function(msg, args, author, channel, guild) {

    if (args.length < 2) {
        return Embeds.sendEmbedError(channel, 'Usage: `report <username/ID/mention> <reason text>`');
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
        Main.mysql.query('INsERT INTO reports VALUES (?, ?, ?, ?)', [victim.id, author.id, Funcs.getTime(), reason]);
        resolve();
    });
}