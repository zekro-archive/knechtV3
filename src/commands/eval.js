var Main = require('../main');
var Util = require('util');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');
var Consts = require('../consts');
var Discord = require('discord.js');
var Request = require('request');

module.exports = function(msg, args, author, channel, guild) {

    // JUST FOR DOUBLE CHECKING
    if (!author.roles.find(r => r.id == Main.config.adminrole)) {
        return Embeds.sendEmbedError(channel, 'PERMISSION DENIED');
    }

    if (args.length < 1) {
        return Embeds.sendEmbedError(channel, 
            'USAGE: `eval <js code>`\n\n' +
            '**Available Objects and Variables:**\n\n' +
            '- [Main](https://github.com/zekroTJA/knechtV3/blob/master/src/main.js)\n' +
            '- [Consts](https://github.com/zekroTJA/knechtV3/blob/master/src/consts.js)\n' +
            '- [Embeds](https://github.com/zekroTJA/knechtV3/blob/master/src/funcs/embeds.js)\n' +
            '- [Funcs](https://github.com/zekroTJA/knechtV3/blob/master/src/funcs/funcs.js)\n' +
            '- [Util](https://nodejs.org/api/util.html)\n' +
            '- [Discord](https://discord.js.org/#/docs/main/stable/general/welcome)\n\n' +
            '- [msg](https://discord.js.org/#/docs/main/stable/class/Message)\n' +
            '- args\n' +
            '- [author](https://discord.js.org/#/docs/main/stable/class/GuildMember)\n' +
            '- [channel](https://discord.js.org/#/docs/main/stable/class/GuildChannel)\n' +
            '- [guild](https://discord.js.org/#/docs/main/stable/class/Guild)\n'
        );
    }

    let cmd = args.join(' ');
    
    return new Promise((resolve, reject) => {
        let res = eval(cmd);
        if (typeof res != 'string')
            res = Util.inspect(res);
        resolve(res);
    }).then(res => {
        channel.send('', Embeds.getEmbed()
            .setTitle('EVAL OUTPUT')
            .setColor(Consts.COLORS.MAIN)
            .setDescription(
                'Command:\n' +
                '```js\n' +
                cmd +
                '\n```\n' +
                'Output:\n' +
                '```js\n' +
                res +
                '\n```'
            ));
    }).catch(err => {
        channel.send('', Embeds.getEmbed()
            .setTitle('EVAL ERROR')
            .setColor(Consts.COLORS.ERROR)
            .setDescription(
                'Command:\n' +
                '```js\n' +
                cmd +
                '\n```\n' +
                'Output:\n' +
                '```js\n' +
                err +
                '\n```'
            ));
    });

}