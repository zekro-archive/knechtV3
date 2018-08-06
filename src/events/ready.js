var Main = require('../main');
var Fs = require('fs');
var Embeds = require('../funcs/embeds');


Main.client.on('ready', () => {
    console.log('Ready');

    if (Main.DEBUGMODE) {
        console.log('Start completed. Shutting down...');
        Main.client.destroy()
            .then(() => process.exit(0));
    }

    if (Fs.existsSync('./.restart')) {
        let content = Fs.readFileSync('./.restart', 'utf8').split(';');
        try {
            let chan = Main.client.guilds.first().channels.get(content[0]);
            chan.fetchMessage(content[1])
                .then(m => {
                    m.edit('', Embeds.getEmbed('Restarted. :ok_hand:'));
                    Fs.unlink('./.restart');
                });
        }
        catch (e) {
            console.log(e);
        }
    }
});