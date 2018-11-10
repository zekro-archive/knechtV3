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
        'MERGE  (b:Bot {id: $botid})' +
        'CREATE (o)-[:OWNS]->(b)'
    );

    // Main.mysql.query('INSERT INTO userbots (botid, ownerid) VALUES (?, ?)', [bot.id, invite.owner.id], (err, res) => {
    //     delete Main.botInvites[bot.id];
    //     bot.addRole(Main.config.userbots);
    //     invite.owner.addRole(Main.config.botowners);
    //     bot.setNickname(`${bot.displayName} (${invite.owner.user.username})`);
    //     Embeds.sendEmbed(invite.owner, 
    //         'Your bot got accepted and joined the guild!\n\n' + 
    //         '**ATTENTION:** Please use the `prefix` command and register your bot prefix as soon as possible! ' +
    //         'Otherwise your bot will be kicked. This is just for prevention of problems with the prefixes of the bots.');
    //     admins.forEach(a => Embeds.sendEmbed(a, `Invite (ID: \`${invite.id}\`) got accepted.`));
    // });
}

function handleQuit(bot) {
    if (!bot.user.bot)
        return;

    Main.mysql.query('SELEcT * FROM userbots WHERE botid = ?', [bot.id], (err, res) => {
        if (err)
            return;
        if (res.length > 0) {
            var owner = bot.guild.members.get(res[0].ownerid);
            Main.mysql.query('DELETE FROM userbots WHERE botid = ?', [bot.id]);
            if (owner) {
                if (res.filter(r => r.ownerid == owner.id).length == 1)
                    owner.removeRole(Main.config.botowners);
            }
        }
    });
}