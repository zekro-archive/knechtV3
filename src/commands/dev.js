const Main = require('../main');
const Request = require('request');
const Embeds = require('../funcs/embeds');
const Funcs = require('../funcs/funcs');

module.exports = function(msg, args, author, channel, guild) {

    if (Funcs.cmdDisallowed(msg))
        return new Promise(r => {r();});

    return new Promise((resolve, reject) => {
        Request(Main.config.urls.devroles, (err, response, body) => {
            if (err) {
                reject(err);
                return;
            }

            let devRoles = Object.keys(JSON.parse(body));
            
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
                a = a.replace(/(, )|,/gm, '').trim().toLowerCase();
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

            
            // author.addRoles(add, 'dev command').then(() => {
            //     author.removeRoles(remove, 'dev command');
            // });

            add.forEach(r => author.addRole(r, 'dev command'));
            remove.forEach(r => author.removeRole(r, 'dev command'));

            let outtext = '';
            if (add.length > 0)
                outtext += `Added roles:\n${add.join(', ')}\n\n`;
            if (remove.length > 0)
                outtext += `Removed roles:\n${remove.join(', ')}`;
            if (add.length == 0 && remove.length == 0)
                outtext = 'No roles changed.';

            msg.delete();
            Embeds.sendEmbed(channel, outtext)
                .then(m => m.delete(4000));
            resolve();
        });
    });
}