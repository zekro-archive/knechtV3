var Main = require('../main');
var Embeds = require('../funcs/embeds');


Main.client.on('channelCreate', handleChannelCreate);

function handleChannelCreate(chan) {
    if (chan.type == 'text') {
        var role = Main.client.guilds.first().roles.find(r => r.name == '[knecht muted]');
        chan.overwritePermissions(role, {
            SEND_MESSAGES: false
        })
    }
}