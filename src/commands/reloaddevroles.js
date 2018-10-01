const Main = require('../main');
const Request = require('request');
const Embeds = require('../funcs/embeds');
const Funcs = require('../funcs/funcs');

function replaceStuff(text) {
    return text
        .replace('#', 'sharp')
        .replace('++', 'pp')
        .replace('.', 'dot')
}

module.exports = function(msg, args, author, channel, guild) {

    if (Funcs.cmdDisallowed(msg))
        return new Promise(r => {r();});

    return new Promise((resolve, reject) => {
        Request(Main.config.urls.devroles, (err, response, body) => {
            if (err) {
                reject(err);
                return;
            }

            let devRoles = JSON.parse(body);

            let roles = guild.roles;
            let chans = guild.channels.filter(c => c.type == 'text');

            Object.keys(devRoles).forEach(async function(role) {

                if (!roles.find(r => r.name.toLowerCase() == role)) {
                    let createdRole = await guild.createRole({
                        name: devRoles[role].displayname,
                        color: devRoles[role].color,
                        mentionable: true,
                    }, 'dev roles update');
                }


                if (!chans.find(c => c.name == replaceStuff(role))) {
                    let createdChan = guild.createChannel(
                        replaceStuff(role),
                        'text',
                        [
                            {
                                id: guild.id,
                                deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                            },
                            {
                                id: Main.config.staffrole,
                                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'MANAGE_MESSAGES']
                            },
                            {
                                id: Main.config.priobots[0],
                                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'MANAGE_MESSAGES']
                            },
                            {
                                id: createdRole ? createdRole.id : roles.find(r => r.name.toLowerCase() == role).id,
                                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                            }
                        ]
                    );
                }
            });

            Embeds.sendEmbed(channel, 'Finished.');

        });
    });
}