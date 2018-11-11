var Embeds = require('../funcs/embeds');
var Main = require('../main');
var Funcs = require('../funcs/funcs');


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

    getStatus: (bot) => {
        if (!bot)
            return 0;
        return (bot.presence.status == 'offline' ? 0 : 1);
    },

    timerHandler: () => {
        var guild = Main.client.guilds.first();

        Main.neo4j.run(
            'MATCH (b:Bot)' +
            'RETURN (b)'
        ).then((res) => {
            res.records.forEach((record) => {
                let node = record.get(0);
                let bot = guild.members.get(node.properties.id);
                if (bot) {
                    let stats = node.properties.uptime;
                    if (!stats) {
                        stats = [];
                    }
                    if (stats.length >= setRange) {
                        stats.splice(0, 1);
                    }
                    stats.push(module.exports.getStatus(bot));
                    Main.neo4j.run(
                        'MATCH (b:Bot {id: $botid})' +
                        'SET b.uptime = $uptime',
                        {
                            botid: bot.id,
                            uptime: stats
                        }
                    );
                }
            });
        });
    },

    startTimer() {
        module.exports.timerHandler();
        setInterval(module.exports.timerHandler, UPTIME_INTERVAL);
    },

    getUptimes(cb) {
        Main.neo4j.run(
            'MATCH (b:Bot)' +
            'RETURN (b)'
        ).then((res) => {
            let result = {};
            res.records.forEach((record) => {
                let node = record.get(0);
                result[node.properties.id] = module.exports.getUptimeFromRow(node);
            });
            cb(result);
        });
    },

    getUptimeFromRow(r) {
        let uptime = r.uptime;
        return Funcs.padStart((calculateUptimePerc(uptime)).toFixed(2), 6);
    }
};