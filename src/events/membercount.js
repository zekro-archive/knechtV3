var Main = require('../main');

Main.client.on('ready', updateMembCount);
Main.client.on('guildMemberAdd', updateMembCount);
Main.client.on('guildMemberRemove', updateMembCount);
Main.client.on('guildMemberUpdate', updateMembCount);


function updateMembCount(member) {
    if (!member)
        var guild = Main.client.guilds.first();
    else
        var guild = member.guild;
    var members = guild.members.map(m => !m.bot).length;
    Main.client.user.setPresence({ game: {
        name: `${members} members`,
        status: 'online'
    }});
}