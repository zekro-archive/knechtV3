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

    createDevRolesMessage(guild, channel);
    createSystemRolesMessage(guild, channel);
    createEtcRolesMessage(guild, channel);

});



function createDevRolesMessage(guild, channel) {
    let emb = Embeds.getEmbed('', '')
        .setTitle('DEV LANGUAGES')
        .setDescription('*Not all languages are listed here. Enter `!dev` in a commands channel to get all dev language roles available!*');

    Request(Main.config.urls.devroles, (err, response, body) => {
        
        let devRoles = JSON.parse(body);
        let devIdents = Object.keys(devRoles).filter(k => devRoles[k].type == "DEV");
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
}


function createSystemRolesMessage(guild, channel) {
    let emb = Embeds.getEmbed('', '')
        .setTitle('SYSTEMS')
        .setColor(0x4DD0E1);;

    Request(Main.config.urls.devroles, (err, response, body) => {
        
        let devRoles = JSON.parse(body);
        let devIdents = Object.keys(devRoles).filter(k => devRoles[k].type == "SYS");
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
}

function createEtcRolesMessage(guild, channel) {
    let emb = Embeds.getEmbed('', '')
        .setTitle('ETC')
        .setColor(0xCDDC39);;

    let etcEmotes = {
        "🔧": "tech",
        "🎨": "design",
        "🎮": "gaming",
        "💸": "economics" 
    }

    Request(Main.config.urls.devroles, (err, response, body) => {
        
        let devRoles = JSON.parse(body);
        let devIdents = Object.keys(devRoles).filter(k => devRoles[k].type == "ETC");
        let addedEmojis = {};
    
        devIdents.forEach(r => {
            let emoji = Object.keys(etcEmotes).find(e => etcEmotes[e] == r);
            if (emoji) {
                addedEmojis[emoji] = r;
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
                                             Object.keys(addedEmojis).includes(reaction.emoji.name); 
            var collector = m.createReactionCollector(filter);
            collector.on('collect', m => {
                let role = guild.roles.find(r => r.name.toLowerCase() == addedEmojis[m.emoji.name]);
                let member = guild.members.get(m.users.last().id);
                if (member.roles.find(r => r.id == role.id))
                    member.removeRole(role);
                else
                    member.addRole(role);
                m.remove(m.users.last());
            });
        });
    
    });
}