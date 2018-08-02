var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');


function getUserString(member) {
    return `${member} (${member.user.tag})`
}

module.exports = function(msg, args, author, channel, guild) {

    if (args.length < 1) {
        return Embeds.sendEmbedError(channel, 'USAGE: `org <github username / url>`');
    }

    return new Promise((resolve, reject) => {

        var id = Funcs.getRandomInt(1111, 9999);

        var admins = guild.roles.find(r => r.id == Main.config.adminrole).members;
        admins.forEach(admin => {
            Embeds.sendEmbed(admin, 
                `[Organization](https://github.com/orgs/Dark-Devs/people) invite request by ${getUserString(author)}:\n` +
                '```\n' + args[0] + '\n```', 
                'GUILD INVITE REQUEST | ID: ' + id)
                .then(m => {
                    m.react('✅');
                    var collector = m.createReactionCollector((reaction, user) => reaction.emoji.name == '✅' && user != Main.client.user);
                    collector.on('collect', (e) => {
                        Embeds.sendEmbed(author, `Your organization invite was send.\nPlease take a look into your mails or on the [Organizations Page](https://github.com/orgs/Dark-Devs).`);
                        collector.stop();
                        admins.forEach(a => Embeds.sendEmbed(a, `Organization invite request (ID: \`${id}\`) was accepted by ${e.users.last()} (${e.users.last().tag}).`));
                    });
                });
        });
        Embeds.sendEmbed(channel, 'Your organization invite was send to the admin team.\nPlease stay patient until they invite you to the organization. Then, you will get a notification via DM.');
        resolve();
    });

}