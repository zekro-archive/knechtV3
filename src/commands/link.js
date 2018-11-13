var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');


module.exports = function(msg, args, author, channel, guild) {

    var unlink = false;

    if (Funcs.cmdDisallowed(msg))
        return new Promise(r => {r();});

    if (args.length < 2)
        return Embeds.sendEmbedError(channel, 'USAGE: `link ([u]) <bot resolvable> <user resolvable>`');
    
    if (args[0].toLowerCase() == 'u') {
        if (args.length < 3) {
            return Embeds.sendEmbedError(channel, 'USAGE: `link ([u]) <bot resolvable> <user resolvable>`');
        }
        unlink = true;
        args = args.slice(1);
    }

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

    if (unlink) {
        return Main.neo4j.run(
            'MATCH  (o:Owner {id: $ownerid})-[r:OWNS]->(b:Bot {id: $botid})' +
            'DELETE (r)',
            {
                ownerid: owner.id,
                botid: bot.id
            }
        ).then(() => {
            Embeds.sendEmbed(channel, `Unlinked bot ${bot} from ${owner}.`);
        }).catch((err) => {
            Embeds.sendEmbedError(channel, 'An error occured linking bot and owner in database: ```' + err + '```');
        });
    }

    return Main.neo4j.run(
        'MERGE  (o:Owner {id: $ownerid})' +
        'MERGE  (b:Bot {id: $botid})' +
        'ON CREATE SET b.uptime = []' +
        'CREATE (o)-[:OWNS]->(b)',
        {
            ownerid: owner.id,
            botid: bot.id
        }
    ).then(() => {
        Embeds.sendEmbed(channel, `Linked bot ${bot} with ${owner}.`);
    }).catch((err) => {
        Embeds.sendEmbedError(channel, 'An error occured linking bot and owner in database: ```' + err + '```');
    });
};