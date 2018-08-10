var Main = require('../main');
var Fs = require('fs');
var Embeds = require('../funcs/embeds');
var Mute = require('../commands/mute');
var Funcs = require('../funcs/funcs');
var Request = require('request');


function replaceStuff(text) {
    return text
        .replace('#', 'sharp')
        .replace('++', 'pp')
        .replace('.', 'dot')
}


Main.client.on('ready', () => {

    let guild = Main.client.guilds.first();
    let channel = guild.channels.find(c => c.id == Main.config.chanselect);

    channel.fetchMessages().then(msgs => channel.bulkDelete(msgs));

    let emb = Embeds.getEmbed('', '');
    
    Request(Main.config.urls.devroles, (err, response, body) => {

        let devRoles = JSON.parse(body);
        let devIdents = Object.keys(devRoles);
        let emojis = guild.emojis;
        let addedEmojis = {};

        devIdents.forEach(r => {
            let emoji = emojis.find(e => e.name == replaceStuff(r));
            if (emoji) {
                addedEmojis[emoji.id] = r;
                if (emoji)
                    emb.addField(devRoles[r].displayname, emoji, true);
            }
        });
        emb.addBlankField(true);

        channel.send('', emb).then(m => {
            Object.keys(addedEmojis).forEach(e => {
                m.react(e);
            });

            let filter = (reaction, user) => user.id != Main.client.user.id &&
                                             Object.keys(addedEmojis).includes(reaction.emoji.id); 
            var collector = m.createReactionCollector(filter);
            collector.on('collect', m => {
                let role = guild.roles.find(r => r.name.toLowerCase() == addedEmojis[m.emoji.id]);
                let member = guild.members.get(m.users.last().id);
                if (member.roles.find(r => r.id == role.id))
                    member.removeRole(role);
                else
                    member.addRole(role);
                m.remove(m.users.last());
            });
        });

    });


});