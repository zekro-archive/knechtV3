var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');
var Request = require('request');


module.exports = function(msg, args, author, channel, guild) {

    // if (!args[0])
    //     return;

    // guild.members.forEach(m => {
    //     m.addRole(args[0])
    //         .then(() => console.log(m.user.tag));
    // });

    var username = 'strukteon';

    var options = {
        uri: `https://api.github.com/orgs/Dark-Devs/memberships/${username}`,
        method: 'PUT',
        headers: {
            'Authorization': `token ${Main.config.githubtoken}`,
            'User-Agent': 'zekroTJA'
        }
    };

    Request(options, (err, res) => {
        console.log(err, res.body);
    });

}