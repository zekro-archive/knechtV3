const Main = require('../main');
const Embeds = require('../funcs/embeds');
const Funcs = require('../funcs/funcs');
const Fs = require('fs');


module.exports = function(msg, args, author, channel, guild) {

    channel.send('', Embeds.getEmbed('Restarting... :wave:'))
        .then(m => {
            Fs.writeFileSync('./.restart', channel.id + ";" + m.id);
            process.exit(0);
        });

}