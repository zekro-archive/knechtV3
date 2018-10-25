var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');
var Uptime = require('../funcs/uptimeCalculator');


module.exports = function(msg, args, author, channel, guild) {

    if (Funcs.cmdDisallowed(msg))
        return new Promise(r => {r();});

    if (args.length < 1) {
        return Embeds.sendEmbedError(channel, 'Usage:\n`prefix <botID> <prefix>`\n`prefix list`');
    }

    if (args[0] == 'list') {

        return new Promise((resolve, reject) => {
            Main.mysql.query('SELECT * FROM userbots', (err, res) => {
                if (err)
                    return;
                let table = [["     BOT", "-------------"], ["  OWNER", "---------"], ["  PREFIX", "----------"], ["  UPTIME", "----------"]];
                res.forEach((r, l) => {
                    let _bot = guild.members.get(r.botid);
                    let _owner = guild.members.get(r.ownerid);
                    if (_bot && _owner) {
                        table[0][l + 2] = (Uptime.getStatus(_bot) ? '✅' : '❌') + '  ' + _bot.user.tag;
                        table[1][l + 2] = _owner.user.tag;
                        table[2][l + 2] = r.prefix ? r.prefix : '[<UNSET>]';
                        table[3][l + 2] = Uptime.getUptimeFromRow(r) + ' %';
                    }
                });
                channel.send('**BOT LIST**\n```' + Funcs.createTable(table, 4) + '```', { split: { prepend: '```', append: '```' } });
                resolve();
            });
        });

    }

    var botID = args[0];
    var prefix = args[1];

    var botacc = guild.members.get(botID);
    if (!botacc) {
        return Embeds.sendEmbedError(channel, 'This bot is not on this guild!');
    }

    if (prefix.length == 1 && !botacc.roles.find(r => Main.config.priobots.includes(r.id))) {
        return Embeds.sendEmbedError(channel, 'Sorry, but all single character prefixes (like `!`, `%`, `$` ...) are reserved for staff and super bots!');
    }

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
                });
            });
        });
    });
}