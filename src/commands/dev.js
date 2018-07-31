var Main = require('../main');
var Request = require('request');
var Embeds = require('../funcs/embeds');

module.exports = function(msg, args, author, channel, guild) {
    return new Promise((resolve, reject) => {
        Request(Main.config.urls.devroles, (err, response, body) => {
            if (err) {
                reject(err);
                return;
            }

            let devRoles = body.split(',').map(e => e.trim());
            
            if (args.length < 1) {
                resolve(Embeds.sendEmbed(channel, 
                    '```' + devRoles.join(', ') + '```\n' +
                    '`dev <role1> <role2> ...`\n' + 
                    '*Roles you still have will be removed.*', 
                    'Available Language Roles'));
                return;
            }

            let add = [];
            let remove = [];
            args.forEach(a => {
                a = a.replace(/(, )|,/gm, '').trim();
                if (!devRoles.includes(a))
                    return;
                let role = guild.roles.find(r => r.name.toLowerCase() == a)
                if (!role)
                    return;
                if (author.roles.find(r => r == role))
                    remove.push(role);
                else
                    add.push(role);
            });

            
            author.addRoles(add, 'dev command').then(() => {
                author.removeRoles(remove, 'dev command');
            });

            resolve(Embeds.sendEmbed(channel, 
                `Added roles:\n${add.join(', ')}\n\nRemoved roles:\n${remove.join(', ')}`
            ));
        });
    });
}