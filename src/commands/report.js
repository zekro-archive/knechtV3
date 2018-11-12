var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');
var Snowflake = require('../funcs/snowflake');
var Consts = require('../consts');
var AcceptMessage = require('acceptmessage');


module.exports = function(msg, args, author, channel, guild) {

    if (Funcs.cmdDisallowed(msg))
        return new Promise(r => {r();});

    msg.delete();

    if (args.length < 2) {
        return Embeds.sendEmbedError(channel, 'Usage:\n`report <user resolvable> <reason text>`\n`report list <user resolvable>`\n\nAvailable types:\n' + 
            Consts.MANUAL_REPORT_TYPES.map((t) => '- `' + t + '`').join('\n'));
    }

    if (args[0] == 'list') {
        let victim = Funcs.fetchMember(guild, args[1], false);
        let victimID = args[1];
        return new Promise((resolve, reject) => {
            Main.mysql.query('SELECT * FROM reports WHERE victim = ?', [victim ? victim.id : victimID], (err, res) => {
                if (err)
                    return;
                if (res.length == 0) {
                    Embeds.sendEmbed(channel, 'This user has a white west!', `Reports for ${victim ? victim.user.tag : `QUITTED (${victimID})`}`);
                    resolve();
                    return;
                }
                let emb = Embeds.getEmbed('', `Reports for ${victim ? victim.user.tag : `QUITTED (${victimID})`}`);
                res.forEach((r, i) => {
                    let reporter = guild.members.get(r.reporter);
                    emb.addField(`Report #${i + 1}`, 
                        `**Date:** \`${r.date}\`\n` +
                        `**Reporter:** ${reporter ? reporter : r.reporter}\n` +
                        '**Reason:**\n```' + r.reason + '```');
                });
                channel.send('', emb);
                resolve();
            });
        });
    }

    var node = new Snowflake.Node(Consts.SNOWFLAKE_NODES.REPORTS);

    var kerbholz = guild.channels.find(c => c.id == Main.config.kerbholz);
    var victim = Funcs.fetchMember(guild, args[0], false);
    var reason = args.slice(1).join(' ');
    var type = 'WARN';
    var uid = node.next();

    if (Consts.MANUAL_REPORT_TYPES.includes(args[1].toUpperCase())) {
        type = args[1].toUpperCase();
        reason = args.slice(2).join(' ');
    }

    if (!victim) {
        return Embeds.sendEmbedError(channel, 'Invalid victim. Can not be found on server.');
    }

    function sendReport() {
        let emb = Embeds.getEmbed('Case ID: `' + uid + '`', 'REPORT')
            .addField('EXECUTOR', `${author} (${author.user.tag})`, true)
            .addField('VICTIM', `${victim} (${victim.user.tag})`, true)
            .addField('TYPE', '```\n' + type + '\n```', false)
            .addField('REASON', reason, false);
            
        if (kerbholz) {
            let khemb = emb;
            if (type == 'AD') {
                khemb = Embeds.getEmbed('Case ID: `' + uid + '`', 'REPORT')
                    .addField('EXECUTOR', `${author} (${author.user.tag})`, true)
                    .addField('VICTIM', `${victim} (${victim.user.tag})`, true)
                    .addField('TYPE', type, false)
                    .addField('REASON', reason.replace(/(https?:\/\/)?(www\.)?((\w)+\.)+([a-zA-Z]{2,}(?!\())(:\d+)?(\/\S+)?(?!\w)/gm, '`<link removed>`'), false);
            }
            kerbholz.send('', khemb);  
        }
    
        victim.send('', emb);
        Embeds.sendEmbed(channel, `Report (\`${uid}\`) of ${victim} was submitted by ${author}.\nReason:\n${reason}`);
        Main.mysql.query(
            'INSERT INTO reports (uid, victim, reporter, date, reason, type) VALUES (?, ?, ?, ?, ?, ?)', 
            [uid, victim.id, author.id, Funcs.getTime(), reason, type]
        );
    }

    new AcceptMessage(Main.client, {
        content: Embeds.getEmbed('', 'REPORT PREVIEW')
            .addField('VICTIM', `${victim} (${victim.user.tag})`)
            .addField('TYPE', '```\n' + type + '\n```')
            .addField('REASON', '```\n' + reason + '\n```')
            .addField('Everything correct?', 'Click ✅ if everything is correct to send the report or click ❌ to cancel.'),
        emotes: {
            accept: '✅',
            deny:   '❌'
        },
        checkUser: author,
        actions: {
            accept: (reaction, user) => {
                sendReport();
            },
            deny: (reaction, user) => {
                Embeds.sendEmbedError(channel, 'Report canceled.');
            }
        }
    }).send(channel);
};