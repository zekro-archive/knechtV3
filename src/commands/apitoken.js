const Main = require('../main');
const Embeds = require('../funcs/embeds');
const Funcs = require('../funcs/funcs');
const Crypto = require('crypto');


module.exports = function(msg, args, author, channel, guild) {

    if (args.length < 1)
        return Embeds.sendEmbedError(channel, 'Please enter your bot you want to link with the token as first argument!');

    let bot = Funcs.fetchMember(guild, args[0], true);

    if (!bot || !bot.user.bot)
        return Embeds.sendEmbedError(channel, 'Bot not found!');
    
    return new Promise((resolve, reject) => {
        Main.mysql.query("SELECT * FROM userbots WHERE botid = ? AND ownerid = ?", [bot.id, author.id], (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            if (res.length < 1) {
                Embeds.sendEmbedError(channel, "You can only create a token linked to a bot that you are the owner of!");
                resolve();
                return;
            }

            let shasum = Crypto.createHash('sha256');
            shasum.update(bot.id + author.id + Math.random().toString());
            let token = shasum.digest('hex');

            Embeds.sendEmbed(channel, 'Token created. Take a look into your DM where you will find the generated token.');
            Embeds.sendEmbed(author, '**ATTENTION: This message will be deleted after 60 seconds!**\n```\n' + token + '\n```')
                .then(m => m.delete(60000));

            Main.mysql.query("UPDATE userbots SET apitoken = ? WHERE botid = ?", [token, bot.id]);
        });
    });
}