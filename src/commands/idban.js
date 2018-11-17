var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');
var consts = require('../consts');
var AcceptMessage = require('acceptmessage');
var Snowflake = require('@zekro/snowflake-js');
var request = require('request');

module.exports = function(msg, args, author, channel, guild) {

    if (args.length < 1) {
        return Embeds.sendEmbedError(channel, 'USAGE: `!idban <UserID> (<Reason>)`');
    }

    var userid = args[0];
    var reason = args.slice(1).join(' ');
    if (!reason) {
        reason = '*No reason set*'
    }

    var memb = guild.members.get(userid);
    if (memb) {
        return Embeds.sendEmbedError(
            channel, 
            `User with this ID (${memb} [\`${memb.user.tag}\`]) is still on this guild.\n` +
            'Please use the default `!ban` command for banning this user.'
        );
    }

    function createBan() {
        request({
            uri: `https://discordapp.com/api/guilds/${guild.id}/bans/${userid}`,
            method: 'PUT',
            headers: {
                'Authorization': 'Bot ' + Main.config.token,
                'Content-Type':  'application/json',
                'Accept':        'application/json'
            },
            body: JSON.stringify({
                reason: reason
            })
        }, (err, res, body) => {
            if (err) {
                Embeds.sendEmbedError(channel, 'An error occured sending API request: ```' + err + '```');
                return;
            }
            if (body) {
                Embeds.sendEmbedError(channel, 'Error: ```\n' + body.message + '\n```');
                return;
            }
            
            let node = new Snowflake.Node(consts.SNOWFLAKE_NODES.REPORTS);
            let uid = node.next();

            let emb = Embeds.getEmbed('Case ID: `' + uid + '`', 'ID BAN')
                .addField('EXECUTOR', `${author} (${author.user.tag})`, true)
                .addField('VICTIM', `\`${userid}\``, true)
                .addField('REASON', reason, false)
                .setColor(0xE91E63);

            channel.send('', emb);

            let kerbholz = guild.channels.get(Main.config.kerbholz);
            if (kerbholz) {
                kerbholz.send('', emb);
            }

            Main.mysql.query(
                'INSERT INTO reports VALUES (?, ?, ?, ?, ?, ?)',
                [uid, userid, author.id, Funcs.getTime(), reason, 'IDBAN']
            );
        });
    }

    new AcceptMessage(Main.client, {
        content: Embeds.getEmbed('', 'REPORT PREVIEW')
            .addField('VICTIM', `\`${userid}\``)
            .addField('REASON', '```\n' + reason + '\n```')
            .addField('Everything correct?', 'Click ✅ if everything is correct to send the report or click ❌ to cancel.'),
        emotes: {
            accept: '✅',
            deny:   '❌'
        },
        checkUser: author,
        actions: {
            accept: (reaction, user) => {
                createBan();
            },
            deny: (reaction, user) => {
                Embeds.sendEmbedError(channel, 'ID ban canceled.');
            }
        }
    }).send(channel);
}