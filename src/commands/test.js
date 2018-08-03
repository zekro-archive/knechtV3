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

    var options = {
        uri: `https://api.github.com/repos/zekroTJA/knechtV3/issues`,
        method: 'POST',
        headers: {
            'Authorization': `token ${Main.config.githubtoken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.symmetra-preview+json',
            'User-Agent': 'zekroTJA'
        },
        body: JSON.stringify({
            title: "Test issue",
            body: "Test issue",
            //labels: [ TYPES[type] ]
        })
    };

    Request(options, (err, res, body) => {
        console.log(body);
    });

}