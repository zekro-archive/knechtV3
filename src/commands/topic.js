var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');


const TOPIC_GROUP_NAME = 'customtopics';

function encodeName(name) {
    return name
        .toLowerCase()
        .replace(/\W/gm, '-');
}

module.exports = function(msg, args, author, channel, guild) {

    if (args.length < 1)
        return Embeds.sendEmbedError(channel, 'USAGE:\n`topic <name> (<description>)`\n`topic close (<name>)`\n`topic hide`');

    var guild = Main.client.guilds.first();

    var group = guild.channels
        .filter(c => c.type == 'category')
        .find(c => c.name.toLowerCase() == TOPIC_GROUP_NAME);

    if (!group) {
        return Embeds.sendEmbedError(channel, 'Could not find specified topic collection: `' + TOPIC_GROUP_NAME + '`');
    }

    if (args[0].toLowerCase() == 'hide') {
        msg.delete();
        let chan = channel;
        if (chan.parent != group) {
            return Embeds.sendEmbedError(channel, 'Channel is no topic channel.');
        }
        return new Promise((resolve, reject) => {
            Main.mysql.query('SELECT creator FROM topics WHERE channel = ?', [chan.id], (err, res) => {
                if (err) {
                    Embeds.sendEmbedError(channel, 'Could not get owner data from database.');
                    reject();
                    return;
                }
                if (res[0].creator == author.id) {
                    Embeds.sendEmbedError(channel, 'You can not hide your own topic channel you have created.')
                        .then((_m) => _m.delete(5000));
                    resolve();
                    return;
                }
                return channel.replacePermissionOverwrites({
                    overwrites: [
                        {
                            id: author.id,
                            denied: ['VIEW_CHANNEL'],
                        }
                    ]
                });
            });
        });
    }

    if (args[0].toLowerCase() == 'close') {
        let chan = channel;
        if (args[1]) {
            let c = Funcs.fetchChannel(args.slice(1).join(' '));
            if (c)
                chan = c;
        }
        if (chan.parent != group) {
            return Embeds.sendEmbedError(channel, 'Channel is no topic channel.');
        }
        return new Promise((resolve, reject) => {
            Main.mysql.query('SELECT creator FROM topics WHERE channel = ?', [chan.id], (err, res) => {
                if (err) {
                    Embeds.sendEmbedError(channel, 'Could not get owner data from database.');
                    reject();
                    return;
                }
                if (res[0].creator != author.id && !author.roles.get(Main.config.staffrole)) {
                    Embeds.sendEmbedError(channel, 'You are not the creator of the channel or an authorized member to close topic channels!');
                    resolve();
                    return;
                }
                chan.delete();
                // let archive = guild.channels.find((c) => c.type == 'category' && c.name.toLowerCase() == 'archive');
                // if (archive) {
                //     msg.delete();
                //     Embeds.sendEmbed(chan, `Topic closed by ${author} and channel got archived.`);
                //     chan.overwritePermissions(guild.id, {
                //         VIEW_CHANNEL: true,
                //         SEND_MESSAGES: false
                //     });
                //     chan.setParent(archive);
                //     Main.mysql.query('DELETE FROM topics WHERE channel = ?', [chan.id]);
                // } else {
                //     chan.delete();
                // }
            });
        });
    }

    Main.mysql.query('SELECT * FROM topics WHERE creator = ?', [author.id], (err, res) => {
        if (err || !res) {
            return Embeds.sendEmbedError(channel, 'Failed getting data from Database: ```' + err + '```');
        }
        if (res.length > 1 && !author.roles.get(Main.config.staffrole)) {
            return Embeds.sendEmbedError(channel, 'Everyone is only allowed to create one topic channel. Close your topic to create another one.');
        }

        var name = encodeName(args[0]);
        var description = args[1] ? args.slice(1).join(' ') : '*No descrption set.*';
        var counter = 0;
        var tname = name;
        while (guild.channels.find(c => c.name == tname)) {
            tname = name + '-' + (++counter);
        }
        name = tname;
    
        return guild.createChannel(name, 'text').then(c => {
            c.setParent(group);
            Main.mysql.query('INSERT INTO topics (channel, creator, name) VALUES (?, ?, ?)', [c.id, author.id, name]);
            Embeds.sendEmbed(channel, `Topic channel <#${c.id}> created by ${author}.`);
            c.send(Embeds.getEmbed('', name)
                .addField('Creator', `${author} (${author.user.tag})`)
                .addField('Description', description)
                .setFooter('Topic channel can be closed using "!topic close" here. Enter "!topic hide" here to hide this channel for you.')
            );
        }).catch(err => {
            Embeds.sendEmbedError(channel, 'Failed creating topic channel: ```\n' + err + '\n```');
        });
    });
}