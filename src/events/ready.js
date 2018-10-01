var Main = require('../main');
var Fs = require('fs');
var Embeds = require('../funcs/embeds');
var Mute = require('../commands/mute');
var Funcs = require('../funcs/funcs');


Main.client.on('ready', () => {
    console.log('Ready');

    var guild = Main.client.guilds.first();

    if (Main.DEBUGMODE) {
        console.log('Start completed. Shutting down...');
        Main.client.destroy()
            .then(() => process.exit(0));
    }

    // CHECK FOR RESTARTED FILE
    if (Fs.existsSync('./.restart')) {
        let content = Fs.readFileSync('./.restart', 'utf8').split(';');
        try {
            let chan = guild.channels.get(content[0]);
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

    // SET ALL CHANNES MUTED ROLE AS PERMISSION
    var muteRole = guild.roles.find(r => r.name == "[knecht muted]");
    guild.channels
        .filter(c => c.type == 'text')
        .forEach(c => c.overwritePermissions(muteRole, {
            SEND_MESSAGES: false
        }));

    // LOAD ALL MUTED ENTRIES IN MUTEDCACHE
    Main.mysql.query('SELECT * FROM muted', (err, res) => {
        if (err)
            return;
        res.forEach(r => {
            Mute.mutedCashe[r.victim] = {
                time: r.expires,
                author: guild.members.get(r.reporter),
                reason: r.reason
            };
        });
    });

    setInterval(() => {
        // MUTE CHECK
        Object.keys(Mute.mutedCashe).forEach(victimid => {
            let mute = Mute.mutedCashe[victimid];
            let victim = guild.members.get(victimid);
            if (mute.time != -1 && Date.now() > mute.time) {
                Mute.autoUnmute(victim, mute, guild);
            }
        });
    }, 20000);
});