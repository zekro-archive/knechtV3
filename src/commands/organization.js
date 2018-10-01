const Main = require('../main');
const Embeds = require('../funcs/embeds');
const Funcs = require('../funcs/funcs');
const Request = require('request');


function getUserString(member) {
    return `${member} (${member.user.tag})`
}

module.exports = function(msg, args, author, channel, guild) {

    if (Funcs.cmdDisallowed(msg))
        return new Promise(r => {r();});

    msg.delete();

    if (args.length < 1) {
        return Embeds.sendEmbedError(channel, 'USAGE: `org <github username / url>`')
            .then(m => m.delete(5000));
    }

    return new Promise((resolve, reject) => {

        let username = args[0];
        if (username.startsWith('https://github.com/') || username.startsWith('www.github.com/') || username.startsWith('github.com/')) {
            let split = username.split('/');
            username = split[split.length - 1];
        }
        
        let options = {
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
                Embeds.sendEmbedError(channel, `There is no GitHub user with the username \`${username}\`.`)
                    .then(m => m.delete(3500));
            else
                Embeds.sendEmbed(channel, 'Invite was send.\nPlease look into your emails or navigate to the [invite page](https://github.com/orgs/Dark-Devs/invitation) to accept the invite.')
                    .then(m => m.delete(3500));
            resolve();
        });
    });

}
