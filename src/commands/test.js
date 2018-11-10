var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');
var Request = require('request');


module.exports = function(msg, args, author, channel, guild) {

    if (!['221905671296253953', '98719514908188672'].includes(author.id)) {
        return
    }
    
    // Main.neo4j.run('MATCH (x:Bot) RETURN x').then((res) => {
    //     res.records[0].forEach((node) => {
    //         let botid = node.properties.id;
    //         let owners = [];
    //         Main.neo4j.run('MATCH (x:Owner)-[:OWNS]->(y:Bot {id: $botid}) RETURN x,y', { botid }).then((res) => {
    //             res.records[0].forEach((node) => {
    //                 owners.push(node.properties.id);
    //             });
    //         }).finally(() => {
    //             console.log(botid, owners);
    //         });
    //     });
    // });

    Main.mysql.query('SELECT * FROM userbots', (err, res) => {
        res.forEach(r => {
            let botid = r.botid;
            let ownerid = r.ownerid;
            let prefix = r.prefix;
            let uptime = r.uptime;

            Main.neo4j.run(
                'CREATE (:Owner {id: $ownerid})-[:OWNS]->(:Bot {id: $botid, prefix: $prefix, uptime: $uptime})',
                { ownerid, botid, prefix, uptime }
            ).catch(console.log);
        });
    });
};