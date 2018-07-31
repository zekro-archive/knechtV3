var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');


module.exports = function(msg, args, author, channel, guild) {

    if (!args[0]) {
        return Embeds.sendEmbedError(channel, 'USAGE:\n`game <text>`\n`game reset`');
    }

    if (args[0] == 'reset') {
        Main.changedGame = false;
        return Embeds.sendEmbed(channel, 'Reset game to member count. It will change when the next member count change will happen.');
    }
    else {
        let msg = args.join(' ');
        Main.changedGame = true;
        Main.client.user.setPresence({ game: {
            name: msg,
            status: 'online'
        }});
        return Embeds.sendEmbed(channel, 'Updated game to: ```' + msg + '```');
    }

}