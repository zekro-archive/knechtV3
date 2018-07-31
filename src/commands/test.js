var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');


module.exports = function(msg, args, author, channel, guild) {

    if (!args[0])
        return;

    guild.member.forEach(m => {
        m.addRole(args[0]);
        console.log(m.user.tag);
    });

}