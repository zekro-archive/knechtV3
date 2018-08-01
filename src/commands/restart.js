var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');
var Fs = require('fs');


module.exports = function(msg, args, author, channel, guild) {

    channel.send('', Embeds.getEmbed('Restarting... :wave:'))
        .then(m => {
            Fs.writeFileSync('./.restart', channel.id + ";" + m.id);
            process.exit(0);
        });

}