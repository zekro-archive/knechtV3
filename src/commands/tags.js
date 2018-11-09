var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');
var AcceptMessage = require('acceptmessage');

module.exports = function(msg, args, author, channel, guild) {

    function createTag(res, cb) {
        if (!args[1]) {
            Embeds.sendEmbedError(channel, 'Please enter a valid tag name!');
            cb(false);
            return;
        }
        if (!args[2]) {
            Embeds.sendEmbedError(channel, 'Please enter a valid tag content!');
            cb(false);
            return;
        }
        
        let content = args.slice(2).join(' ')
            .replace(/\|([A-Za-z]+)\|/gm, ':$1:');
        let tag = res.find(r => r.name == args[1].toLowerCase());
        if (tag) {
            new AcceptMessage(Main.client, {
                content: Embeds.getEmbed('The specified tag does still exists with following content:\n```\n' + tag.content +
                                         '\n```\nDo you want to overwrite the tag?'),
                emotes: {
                    accept: '✅',
                    deny:   '❌'
                },
                checkUser: author,
                actions: {
                    accept: () => {
                        Main.mysql.query("UPDATE tags SET content = ? WHERE name = ?", [content, tag.name]);
                        Embeds.sendEmbed(channel, 'Tag edited.');
                        cb(true);
                    },
                    deny:   () => {
                        Embeds.sendEmbedError(channel, 'Canceled.');
                        cb(false);
                    }
                }
            }).send(channel);
        }
        else {
            Main.mysql.query('INSERT INTO tags VALUES (?, ?, ?)', [args[1].toLowerCase(), author.id, content]);
            Embeds.sendEmbed(channel, 'Tag created.');
            cb(true);
        }
    }

    function deleteTag(res, cb) {
        if (!args[1]) {
            Embeds.sendEmbedError(channel, 'Please enter a valid tag name to delete!');
            cb(false);
            return;
        }

        let tag = res.find(r => r.name == args[1].toLowerCase());
        if (!tag) {
            Embeds.sendEmbedError(channel, 'No tag exists with the specified name.');
            cb(false);
            return;
        }

        Main.mysql.query('DELETE FROM tags WHERE name = ?', [tag.name]);
        Embeds.sendEmbed(channel, 'Deleted tag.');
        cb(true);
    }

    function sendTag(res, cb) {
        if (!args[0]) {
            cb(false);
            return;
        }
        let tag = res.find(r => r.name == args[0].toLowerCase());
        if (!tag) {
            cb(false);
            return;
        }
        let creator = guild.members.get(tag.creator);
        msg.delete();
        channel.send('', Embeds.getEmbed(tag.content)
            .setFooter(`Tag created by ${creator ? creator.user.tag : '<unknown>'}`));
        cb(true);
    }

    function sendTagList(res) {
        let table = [['NAME', '----'], ['CREATOR', '-------'], ['CONTENT', '-------']];
        res.forEach(r => {
            let creator = guild.members.get(r.creator);
            table[0].push(r.name);
            table[1].push(creator ? creator.user.tag : r.creator);
            table[2].push(r.content.replace(/\n/gm, '\\n').substr(0, 100));
        });
        channel.send('**TAGS LIST**\n\n```\n' + Funcs.createTable(table, 3) + '\n```', { split: { prepend: '```', append: '```' } });
    }

    return new Promise((resolve, reject) => {
        Main.mysql.query('SELECT * FROM tags', (err, res) => {
            if (err)
                throw err;
            
            switch (args[0]) {
                    
                case 'c':
                case 'create':
                case 'add':
                    createTag(res, success => {});
                    break;
                
                case 'r':
                case 'remove':
                case 'delete':
                    deleteTag(res, success => {});
                    break;

                default:
                    sendTag(res, success => {
                        if (!success)
                            sendTagList(res);
                    });
            }

        });
    });

    

}