var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');


module.exports = function(msg, args, author, channel, guild) {

    if (args.length < 1) {
        return Embeds.sendEmbedError(channel, 'Usage:\n`prefix <botID> <prefix>`\n`prefix list`');
    }

    if (args[0] == 'list') {

        return new Promise((resolve, reject) => {
            Main.mysql.query('SELECT * FROM userbots', (err, res) => {
                if (err)
                    return;
                let botnames = '';
                let ownernames = '';
                let prefixes = '';
                res.forEach(r => {
                    let _bot = guild.members.get(r.botid);
                    let _owner = guild.members.get(r.ownerid);
                    if (_bot && _owner) {
                        botnames += _bot.toString() + "\n";
                        ownernames += _owner.toString() + "\n";
                        prefixes += r.prefix ? ('`' + r.prefix + '`\n') : '**UNSET**\n';
                    }
                });
                channel.send('', 
                    Embeds.getEmbed('', 'PREFIX LIST')
                        .addField('BOT', botnames, true)
                        .addField('OWNER', ownernames, true)
                        .addField('PREFIX', prefixes, true));
                resolve();
            });
        });

    }

    var botID = args[0];
    var prefix = args[1];

    return new Promise((resolve, reject) => {
        Main.mysql.query('SELECT * FROM userbots WHERE botid = ? AND ownerid = ?', [botID, author.id], (err, res) => {
            if (err)
                return;
            if (res.length == 0) {
                Embeds.sendEmbedError(channel, 'You can only register the prefix for your own bot!');
                resolve();
                return;
            }
            Main.mysql.query('SELECT * FROM userbots', (err, res) => {
                if (err)
                    return;
                var used = [];
                res.forEach(r => used.push(r.prefix));
                if (used.includes(prefix)) {
                    Embeds.sendEmbedError(channel, 'The entered prefix is still used. Please chose an unused prefix!');
                    resolve();
                    return;
                }
                Main.mysql.query('UPDATE userbots SET prefix = ? WHERE botid = ?', [prefix, botID], (err, res) => {
                    Embeds.sendEmbed(channel, `Changed prefix of bot <@${botID}> to \`${prefix}\`.`);
                })
            });
        });
    });
}