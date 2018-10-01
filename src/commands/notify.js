const Main = require('../main');
const Embeds = require('../funcs/embeds');
const Funcs = require('../funcs/funcs');


module.exports = function(msg, args, author, channel, guild) {

    if (Funcs.cmdDisallowed(msg))
        return new Promise(r => {r();});

    let role = guild.roles.find(r => r.id == Main.config.notifyrole);

    if (role) {

        msg.delete();

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