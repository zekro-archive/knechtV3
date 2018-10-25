const request = require('request');
const querystring = require('querystring');

/**
 * 
 */
class DiscordOAuth {

    /**
     * Create new instance of DiscordOAuth.
     * @param {string} options.clientid     ID of the Discord API APP (NOT the ID of the bot's account!)
     * @param {string} options.clientsecret Secret of the Discord API APP (NOT the token of the bot!)
     * @param {string} options.serveraddr   The address of the server (including protocol (http:// or https://) port, 
     *                                      if not accessed over 443 or 80)
     */
    constructor(options) {
        this.options = options;
    }

    /**
     * Redirect the request to the OAuth Authorization Endpoint
     * @param {string}           authRoot The name of the GET endpoint where the redirect should end
     * @param {express.Response} response The response passed by express app callback
     */
    redirectToAuth(authRoot, response) {
        response.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${this.options.clientid}&redirect_uri=${encodeURIComponent(this.options.serveraddr + '/' + authRoot)}&response_type=code&scope=identify`);
    }

    /**
     * Get the Users ID by response code from 'DiscordOAuth#redirectToAuth' redirect.
     * @param {express.Request} req The request passed by express app callback
     * @param {function}        cb  Callback function(error, userID)
     */
    getId(req, cb) {
        let code = req.query.code;

        let data = {
            'client_id': this.options.clientid,
            'client_secret': this.options.clientsecret,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': this.options.serveraddr + '/authorize',
            'scope': 'identify'
        };

        request({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            uri: 'https://discordapp.com/api/oauth2/token',
            body: querystring.stringify(data),
            method: 'POST'
        }, (err, _, body) => {
            let bobj = JSON.parse(body);
            if (err || bobj.error) {
                cb(err);
                return;
            }
            request({
                headers: {
                    'Authorization': 'Bearer ' + bobj.access_token
                },
                uri: 'https://discordapp.com/api/users/@me',
                method: 'GET'
            }, (err, _, body) => {
                let bobj = JSON.parse(body);
                if (err || bobj.error) {
                    cb(err);
                    return;
                }

                cb(null, bobj.id);
            });
        });
    }
};

module.exports = DiscordOAuth;