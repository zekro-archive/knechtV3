var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');
var Request = require('request');


function getUserString(member) {
    return `${member} (${member.user.tag})`
}

module.exports = function(msg, args, author, channel, guild) {

    if (args.length < 1) {
        return Embeds.sendEmbedError(channel, 'USAGE: `org <github username / url>`');
    }

    return new Promise((resolve, reject) => {

        var username = args[0];
        if (username.startsWith('https://github.com/') || username.startsWith('www.github.com/') || username.startsWith('github.com/')) {
            let split = username.split('/');
            username = split[split.length - 1];
        }
        
        var options = {
            uri: `https://api.github.com/orgs/Dark-Devs/memberships/${username}`,
            method: 'PUT',
            headers: {
                'Authorization': `token ${Main.config.githubtoken}`,
                'User-Agent': 'zekroTJA'
            }
        };
    
        Request(options, (err, res) => {
            let body = JSON.parse(res.body);
            if (body.message == 'Not Found')
                Embeds.sendEmbedError(channel, `There is no GitHub user with the username \`${username}\`.`);
            else
                Embeds.sendEmbed(channel, 'Invite was send.\nPlease look into your emails or navigate to the [organizations page](https://github.com/Dark-Devs) to accept the invite.');
            resolve();
        });
    });

}