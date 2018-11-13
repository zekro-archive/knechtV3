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
        return Funcs.getBotList().then((botlist) => {
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

    return Main.neo4j.run(
        'MATCH (b:Bot {id: $botid})<-[:OWNS]-(:Owner {id: $ownerid})' +
        'RETURN (b)',
        {
            botid: botID,
            ownerid: author.id
        }
    ).then((res) => {
        if (res.records.length == 0) {
            Embeds.sendEmbedError(channel, 'You can only register the prefix for your own bot!');
            return;
        }
        Main.neo4j.run(
            'MATCH (b:Bot {prefix: $prefix})' +
            'RETURN (b)',
            { prefix }
        ).then((res) => {
            if (res.records.length > 0) {
                Embeds.sendEmbedError(channel, 'The entered prefix is still used. Please chose an unused prefix!');
                return;
            }
            Main.neo4j.run(
                'MATCH (b:Bot {id: $botid})' +
                'SET b.prefix = $prefix',
                {
                    botid: botID,
                    prefix: prefix
                }
            ).then(() => {
                Embeds.sendEmbed(channel, `Changed prefix of bot <@${botID}> to \`${prefix}\`.`);
            }).catch((err) => {
                Embeds.sendEmbedError(channel, 'Failed changing database values: ```' + err + '```');
            });
        });
    });
};