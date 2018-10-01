var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');


module.exports = function(msg, args, author, channel, guild) {

    if (Funcs.cmdDisallowed(msg))
        return new Promise(r => {r();});

    if (args.length < 2)
        return Embeds.sendEmbedError(channel, 'USAGE: `link <bot resolvable> <user resolvable>`');
    

    let m1 = Funcs.fetchMember(guild, args[0], true);
    let m2 = Funcs.fetchMember(guild, args[1], true);

    if (!m1) 
        return Embeds.sendEmbedError(channel, 'Can not find any bot or member by the resolvable: ```\n' + args[0] + '\n```.');

    if (!m2) 
        return Embeds.sendEmbedError(channel, 'Can not find any bot or member by the resolvable: ```\n' + args[1] + '\n```.');

    if (m1.user.bot && m2.user.bot)
        return Embeds.sendEmbedError(channel, 'You can not link two bots together!');
    
    if (!m1.user.bot && !m2.user.bot)
        return Embeds.sendEmbedError(channel, 'You can not link two users together!');

    let bot = m1.user.bot ? m1 : m2;
    let owner = (bot == m1) ? m2 : m1;

    return new Promise((resolve, reject) => {
        Main.mysql.query('UPDATE userbots SET ownerid = ? WHERE botid = ?', [owner.id, bot.id], (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            if (res.affectedRows < 1) {
                Main.mysql.query('INSERT INTO userbots (botid, ownerid) VALUES (?, ?)', [bot.id, owner.id], (err, res) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    Embeds.sendEmbed(channel, `Linked bot ${bot} with ${owner}.\nThis is a new entry for this bot, so please **set the prefix of the bot**!`);
                });
            }
            else {
                Embeds.sendEmbed(channel, `Linked bot ${bot} with ${owner}.`);
            }
            resolve();
        });
    });
}