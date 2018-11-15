var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');
var consts = require('../consts');
var Snowflake = require('@zekro/snowflake-js');

module.exports = function(msg, args, author, channel, guild) {

    if (!['221905671296253953', '98719514908188672'].includes(author.id)) {
        return
    }

    var node = new Snowflake.Node(0);

    Main.mysql.query('SELECT * FROM reports', (err, res) => {
        res.forEach((r) => {
            let uid = node.next();
            let type = 'WARN';
            if (r.reason.includes('BAN'))
                type = 'BAN';
            else if (r.reason.includes('KICK'))
                type = 'KICK';
            Main.mysql.query('UPDATE reports SET uid = ?, type = ? WHERE victim = ? AND reporter = ? AND date = ?', [uid, type, r.victim, r.reporter, r.date]);
        });
    });
};