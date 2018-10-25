var Embeds = require('../funcs/embeds');
var Main = require('../main');


const UPTIME_INTERVAL =           3600 * 1000;
const UPTIME_RANGE    = 30 * 24 * 3600 * 1000;

var setRange = UPTIME_RANGE / UPTIME_INTERVAL;


function calculateUptimePerc(set) {
    if (!set)
        return 0;
    let ups = set.filter((e) => e === 1).length;
    return ups / set.length * 100;
}

module.exports = {

    timerHandler: () => {
        var guild = Main.client.guilds.first();
        Main.mysql.query('SELECT * FROM userbots', (err, res) => {
            if (err) {
                console.log('ERROR: ', err)
                return;
            }
            res.forEach((r) => {
                let bot = guild.members.get(r.botid);
                if (bot) {
                    try {
                        let stats = JSON.parse(r.uptime)
                        if (!stats) {
                            stats = [];
                        }
                        if (stats.length >= setRange) {
                            stats.splice(0, 1);
                        }
                        stats.push(bot.presence.status == 'offline' ? 0 : 1);
                        Main.mysql.query('UPDATE userbots SET uptime = ? WHERE botid = ?', [JSON.stringify(stats), bot.id]);
                    } catch(e) {
                        console.log('ERROR: ', e)
                    }
                }
            });
        });
    },

    startTimer() {
        module.exports.timerHandler();
        setInterval(module.exports.timerHandler, UPTIME_INTERVAL);
    },

    getUptimes(cb) {
        Main.mysql.query('SELECT * FROM userbots', (err, res) => {
            if (err) {
                cb(null, err);
                return;
            }
            var result = {};
            res.forEach((r) => {
                result[r.botid] = module.exports.getUptimeFromRow(r)
            });
            cb(result);
        });
    },

    getUptimeFromRow(r) {
        try {
            let uptime = JSON.parse(r.uptime);
            return calculateUptimePerc(uptime);
        } catch (e) {
            console.log('ERROR: ', e)
            return 'err';
        }
    }
};