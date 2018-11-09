var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');
var AcceptMessage = require('acceptmessage');

module.exports = function(msg, args, author, channel, guild) {
    var emb = Embeds.getEmbed('© 2018-now zekro Development', 'Knecht V3 Info')
        .setThumbnail(Main.client.user.avatarURL)
        .addField('Help Command', '```\n' + Main.config.prefix + 'help\n```\nAlso a detailed list of commands can be found [**here**](https://github.com/zekroTJA/knechtV3/wiki/Commands).')
        .addField('Wrapper', 'discord.js', true)
        .addField('License', 'MIT', true)
        .addField('GitHub Repository', ':link:  [**github.com/zekroTJA/KnechtV3**](https://github.com/zekroTJA/knechtV3)')
        .addField('3rd Party Dependencies', 
`- [discord.js](https://npmjs.com/package/discord.js)
- [discordjs-cmds](https://npmjs.com/package/discordjs-cmds)
- [acceptmessage](https://npmjs.com/package/acceptmessage)
- [mysql](https://npmjs.com/package/mysql)
- [express](https://npmjs.com/package/express)
- [express-handlebars](https://npmjs.com/package/express-handlebars)
- [body-parser](https://npmjs.com/package/body-parser)
- [request](https://npmjs.com/package/request)`)
        .setImage('https://zekro.de/src/shinobu_smile_banner.jpg')
    return channel.sendMessage('', emb);
}