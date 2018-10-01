const Main = require('../main');

Main.client.on('ready', updateMembCount);
Main.client.on('guildMemberAdd', updateMembCount);
Main.client.on('guildMemberRemove', updateMembCount);
Main.client.on('guildMemberUpdate', updateMembCount);


function updateMembCount(member) {
    if (Main.changedGame)
        return;
    if (!member)
        let guild = Main.client.guilds.first();
    else
        let guild = member.guild;
    let members = guild.memberCount;
    Main.client.user.setPresence({ game: {
        name: `${members} members`,
        status: 'online'
    }});
}

exports.updateMembCount = updateMembCount;