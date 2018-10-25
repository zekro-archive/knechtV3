var Main = require('../main');
var Embeds = require('../funcs/embeds');
var DiscordOAuth = require('../funcs/discordOAuth');

var express = require('express');
var hbs = require('express-handlebars');
var bodyParser = require('body-parser');
var path = require('path');

const SESSION_TIMEOUT = 5 * 60 * 1000;

var CODES = {
    OK: 0,
    ERR_AUTH: 1,
    ERR_DB: 2,
    ERR_INTERNAL: 3,
    ERR_NO_STAFF: 4
}


class WebSocket {

    constructor(token, port, client) {
        this.token = token;
        this.port = port;
        this.client = client;

        this.oauth = new DiscordOAuth({
            clientid: Main.config.client.id,
            clientsecret: Main.config.client.secret,
            serveraddr: Main.config.webinterface.rootaddr
        });

        this.authcodes = {};

        this.app = express();

        this.app.engine('hbs', hbs({
            extname: 'hbs',                     
            defaultLayout: 'layout',            
            layoutsDir: __dirname + '/layouts'  
        }));
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.set('view engine', 'hbs');
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());

        this.registerRoots();

        this.server = this.app.listen(port, () => {
            console.log("Websocket API set up at port " + this.server.address().port);
        });
    }

    checkCode(code, userid) {
        return (this.authcodes[code] && this.authcodes[code] == userid);
    }

    registerRoots() {
        
        this.app.get('/', (req, res) => {
            this.oauth.redirectToAuth('authorize', res);
        });

        this.app.get('/authorize', (req, res) => {
            this.oauth.getId(req, (err, userID) => {
                if (err || !userID) {
                    res.render('error', { code: CODES.ERR_AUTH, message: 'Unauthorized.' });
                    return;
                }
                var guild = Main.client.guilds.first();

                var member = guild.members.get(userID);
                if (!member) {
                    res.render('error', { code: CODES.ERR_AUTH, message: 'Unauthorized: No member of the guild.' });
                    return;
                }

                if (!member.roles.get(Main.config.staffrole)) {
                    res.render('error', { code: CODES.ERR_AUTH, message: 'Unauthorized: No staff member.' });
                    return;
                }
                
                let code = req.query.code;
                this.authcodes[code] = userID;
                res.redirect(`/wi?code=${code}&userid=${userID}`);
            })
        })

        this.app.get('/wi', (req, res) => {
            let code = req.query.code;
            let userID = req.query.userid;
            let query = req.query.query;
            if (query)
                query = query.toLowerCase();

            if (!this.checkCode(code, userID)) {
                res.render('error', { code: CODES.ERR_AUTH, message: 'Unauthorized.' });
                return;
            }

            setTimeout(() => { delete this.authcodes[code] }, SESSION_TIMEOUT);

            Main.mysql.query('SELECT * FROM reports', (err, sqlres) => {
                if (err) {
                    res.render('error', { code: CODES.ERR_DB, message: 'Database error:\n' + err });
                    return;
                }
                let members = Main.client.guilds.first().members;
                let fields = [];
                sqlres.forEach(r => {
                    let victim = members.get(r.victim);
                    let reporter = members.get(r.reporter);
                    let victimname = victim ? victim.user.tag : 'NOT ON GUILD';
                    let reportername =  reporter ? reporter.user.tag : 'NOT ON GUILD';
                    if (
                        !query || 
                        r.victim.includes(query) ||
                        r.reporter.includes(query) ||
                        victimname.toLowerCase().includes(query) ||
                        reportername.toLowerCase().includes(query)
                    ) {
                        fields.push({
                            victimname,
                            reportername,
                            victimid:     r.victim,
                            reporterid:   r.reporter,
                            date:         r.date,
                            reason:       r.reason
                        });
                    }
                });
                fields.reverse();
                res.render('index', { code, userID, fields });
            });
        });

    }

}

module.exports = WebSocket