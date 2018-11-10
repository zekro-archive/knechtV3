var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');
var Uptime = require('../funcs/uptimeCalculator');


module.exports = function(msg, args, author, channel, guild) {

    if (Funcs.cmdDisallowed(msg))
        return new Promise(r => {r();});

    if (args.length < 1) {
        return Embeds.sendEmbedError(channel, 'USAGE:\n`bots list`\n`bot <user/bot resolvable>`');
    }

    function botlistCollected(botlist) {
        if (args[0] == 'list' || args[0] == 'ls') {
            let table = [["     BOT", "-------------"], ["  OWNERS", "---------"], ["  PREFIX", "----------"], ["  UPTIME", "----------"]];
            Object.keys(botlist).forEach((k, l) => {
                let _obj = botlist[k];
                let _bot = guild.members.get(k);
                let _owners = _obj.owners.map((oid) => {
                    let o = guild.members.get(oid);
                    if (o)
                        return o.user.tag;
                    return oid;
                }).join(', ');
                if (_bot) {
                    table[0][l + 2] = (Uptime.getStatus(_bot) ? '✅' : '❌') + '  ' + _bot.user.tag;
                    table[1][l + 2] = _owners;
                    table[2][l + 2] = _obj.prefix ? _obj.prefix : '[<UNSET>]';
                    table[3][l + 2] = Uptime.getUptimeFromRow(_obj) + ' %';
                }
            });
            channel.send('**BOT LIST**\n```' + Funcs.createTable(table, 4) + '```', { split: { prepend: '```', append: '```' } });
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
            let dbentry = botlist[object.id];
            if (!dbentry) {
                Embeds.sendEmbedError(channel, "This bot is not registered.");
                return;
            }
            let owners = dbentry.owners.map((oid) => {
                let o = guild.members.get(oid);
                if (o)
                    return `${o} (${o.user.tag})`;
                return oid + ' (NOT ON GUILD)';
            }).join('\n');
            var embed = Embeds.getEmbed('', 'BOT INFO')
                .addField('OWNERS', owners)
                .addField('PREFIX', '```\n' + (dbentry.prefix ? dbentry.prefix : '[< UNREGISTERED >]') + '\n```')
                .addField('BOTID', '```\n' + object.id + '\n```')
                .addField('STATUS', (Uptime.getStatus(object) ? '✅' : '❌'), true)
                .addField('UPTIME', Uptime.getUptimeFromRow(dbentry) + ' %', true);
        }
        else {
            let dbentries = Object.keys(botlist).filter(k => botlist[k].owners.includes(object.id));
            dbentries = dbentries.map((k) => botlist[k]);
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
                            `**PREFIX:** \`${e.prefix ? e.prefix : '[< UNREGISTERED >]'}\`\n` +
                            `**UPTIME:** ${Uptime.getUptimeFromRow(e)}\n` + 
                            `**STATUS:** ${Uptime.getStatus(bot) ? '✅' : '❌'}`);
                });
            }
        }

        channel.send('', embed);
        resolve();
    }

    return new Promise((resolve, reject) => {

        Main.neo4j.run('MATCH (x:Bot) RETURN x').then((res) => {
            let botlist = [];
            let nNodes = res.records[0].length;
            res.records[0].forEach((node) => {
                let botid = node.properties.id;
                let prefix = node.properties.prefix;
                let uptime = node.properties.uptime;
                let owners = [];
                Main.neo4j.run('MATCH (x:Owner)-[:OWNS]->(:Bot {id: $botid}) RETURN x', { botid }).then((res) => {
                    res.records.forEach((record) => {
                        owners.push(record.get(0).properties.id);
                    });

                    botlist[botid] = {
                        uptime,
                        prefix,
                        owners,
                        botid
                    };

                    if (--nNodes == 0) {
                        botlistCollected(botlist);
                    }
                });
            });
        });
    });
};