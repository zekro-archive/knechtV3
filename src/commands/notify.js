var Main = require('../main');
var Embeds = require('../funcs/embeds');


module.exports = function(msg, args, author, channel, guild) {

    var role = guild.roles.find(r => r.id == Main.config.notifyrole);

    if (role) {

        if (author.roles.find(r => r == role)) {
            author.removeRole(role, 'notify disabled');
            return Embeds.sendEmbed(channel, 'Notify disabled.')
                .then(m => m.delete(4000));
        }
        else {
            author.addRole(role, 'notify enabled');
            return Embeds.sendEmbed(channel, 'Notify enabled.')
                .then(m => m.delete(4000));
        }

    }

}