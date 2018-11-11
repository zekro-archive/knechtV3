var Main = require('../main');
var Embeds = require('../funcs/embeds');


Main.client.on('guildMemberAdd', handleJoin);
Main.client.on('guildMemberRemove', handleQuit);


function handleJoin(bot) {
    if (!bot.user.bot)
        return;

    if (!Object.keys(Main.botInvites).includes(bot.id))
        return;

    let invite = Main.botInvites[bot.id];

    var admins = bot.guild.roles.find(r => r.id == Main.config.adminrole).members;

    Main.neo4j.run(
        'MERGE  (o:Owner {id: $ownerid})' +
        'MERGE  (b:Bot {id: $botid, uptime: []})' +
        'CREATE (o)-[:OWNS]->(b)',
        { 
            ownerid: invite.owner.id, 
            botid: bot.id 
        }
    ).then((res) => {
        delete Main.botInvites[bot.id];
        bot.addRole(Main.config.userbots);
        invite.owner.addRole(Main.config.botowners);
        bot.setNickname(`${bot.displayName} (${invite.owner.user.username})`);
        Embeds.sendEmbed(invite.owner, 
            'Your bot got accepted and joined the guild!\n\n' + 
            '**ATTENTION:** Please use the `prefix` command and register your bot prefix as soon as possible! ' +
            'Otherwise your bot will be kicked. This is just for prevention of problems with the prefixes of the bots.');
        let adminlogchan = bot.guild.channels.get(Main.config.adminlog);
        if (adminlogchan)
            Embeds.sendEmbed(adminlogchan, `Bot ${bot} (${bot.user.tag}) joined.`);
    });
}

function handleQuit(bot) {
    if (!bot.user.bot)
        return;

    Main.neo4j.run(
        'MATCH (o:Owner)-[:OWNS]->(b:Bot {id: $botid})' +
        'DETACH DELETE (b)' + 
        'RETURN (o)',
        { botid: bot.id }
    ).then((res) => {
        res.records.forEach((record) => {
            let owner = bot.guild.members.get(record.get(0).properties.id);
            if (owner) {
                Main.neo4j.run(
                    'MATCH (:Onwer {id: $ownerid})-[:OWNS]->(b:Bot)' +
                    'RETURN (b)',
                    { owner: owner.id }
                ).then((res) => {
                    if (res.records.length == 0) {
                        owner.removeRole(Main.config.botowners);
                    }
                });
            }
        });
    });
}