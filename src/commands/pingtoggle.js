var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');


module.exports = function(msg, args, author, channel, guild) {

    if (!args[0]) {
        let mentionbleRoles = guild.roles
            .filter((r) => r.mentionable)
            .map((r) => `- ${r} (${r.name})`)
            .join('\n');
        return Embeds.sendEmbed(channel, mentionbleRoles + 
            '\n\nEnable or disable mentionability of a role with `!ment <roleResolvable>`',
            'Currently mentionable roles:');
    }

    let role = Funcs.fetchRole(guild, args[0]);
    if (!role) {
        return Embeds.sendEmbedError(channel, 'Cound not fetch any role to the input ```\n' + args[0] + '\n```');
    }

    let currState = role.mentionable;
    role.setMentionable(!currState).then(() => {
        return Embeds.sendEmbed(channel, (currState ? '**DISABLED**' : '**ENABLED**') + ' mentionability for role ' + role)
            .then((m) => m.delete(3500));
    }).catch((e) => {
        return Embeds.sendEmbedError(channel, 'Failed tweaking mentionability:\n```' + e + '\n```');
    });
}