var Main = require('../main');
var express = require('express');
var hbs = require('express-handlebars');
var bodyParser = require('body-parser');
var path = require('path');


var CODES = {
    OK: 0,
    ERR_AUTH: 1,
    ERR_DB: 2,
}


class WebSocket {

    constructor(token, port, client) {
        this.token = token
        this.port = port
        this.client = client
        this.app = express()

        this.app.engine('hbs', hbs({
            extname: 'hbs',                     
            defaultLayout: 'layout',            
            layoutsDir: __dirname + '/layouts'  
        }))
        this.app.set('views', path.join(__dirname, 'views'))
        this.app.set('view engine', 'hbs')
        this.app.use(express.static(path.join(__dirname, 'public')))
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());

        this.registerRoots()

        this.server = this.app.listen(port, () => {
            console.log("Websocket API set up at port " + this.server.address().port);
        })
    }

    checkToken(_token) {
        return _token == this.token;
    }

    registerRoots() {
        
        this.app.get('/', (req, res) => {
            res.render('login');
        });

        this.app.post('/wilogin', (req, res) => {
            let token = req.body.token;
            let query = req.body.query;
            if (query)
                query = query.toLowerCase();

            if (!this.checkToken(token)) {
                res.render('error', { code: CODES.ERR_AUTH, message: 'Authentication failure.' });
                return;
            }

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
                res.render('index', { token, fields });
            });
        });

    }

}

module.exports = WebSocket