var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');


module.exports = function(msg, args, author, channel, guild) {

    if (Funcs.cmdDisallowed(msg))
        return new Promise(r => {r();});

    if (args.length < 1) {
        return Embeds.sendEmbedError(channel, 'USAGE:\n`bots list`\n`bot <user/bot resolvable>`');
    }

    return new Promise((resolve, reject) => {

        Main.mysql.query('SELECT * FROM userbots', (err, res) => {
            if (err) {
                reject(err);
                return;
            }

            if (args[0] == 'list' || args[0] == 'ls') {
                let table = [["BOT", "---"], ["OWNER", "-----"], ["PREFIX", "------"]];
                res.forEach((r, l) => {
                    let _bot = guild.members.get(r.botid);
                    let _owner = guild.members.get(r.ownerid);
                    if (_bot && _owner) {
                        table[0][l + 2] = _bot.user.tag;
                        table[1][l + 2] = _owner.user.tag;
                        table[2][l + 2] = r.prefix ? r.prefix : '[<UNSET>]';
                    }
                });
                channel.send('**BOT LIST**\n```' + Funcs.createTable(table, 4) + '```');
                resolve();
                return;
            }

            let object = Funcs.fetchMember(guild, args[0], true);

            if (!object) {
                Embeds.sendEmbedError(channel, 'Can not fetch any member to the given identifier!');
                resolve();
                return;
            }

            if (object.user.bot) {
                let dbentry = res.find(r => r.botid == object.id);
                let owner = guild.members.get(dbentry.ownerid);
                var embed = Embeds.getEmbed('', 'BOT INFO')
                    .addField('OWNER', `${owner ? (`${owner} (${owner.user.tag} - ${owner.id})`) : `NOT ON GUILD`}`)
                    .addField('PREFIX', '```\n' + (dbentry.prefix ? dbentry.prefix : '[< UNREGISTERED >]') + '\n```')
                    .addField('BOTID', '```\n' + object.id + '\n```');
            }
            else {
                let dbentries = res.filter(r => r.ownerid == object.id);
                var embed = Embeds.getEmbed('', 'OWNER INFO');
                if (dbentries.length == 0) {
                    embed.setDescription('This user owns no user bots.');
                }
                else {
                    dbentries.forEach(e => {
                        let bot = guild.members.get(e.botid);
                        if (!bot)
                            embed.addField(e.botid, '**NOT ON THIS GUILD**');
                        else
                            embed.addField(bot.user.tag, 
                                `**Mention:** ${bot}\n` +
                                `**ID:** \`${bot.id}\`\n` +
                                `**PREFIX:** \`${e.prefix ? e.prefix : '[< UNREGISTERED >]'}\``);
                    });
                }
            }

            channel.send('', embed);
            resolve();

        });
    });
}