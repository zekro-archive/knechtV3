const Main = require('../main');
const Embeds = require('../funcs/embeds');
const Funcs = require('../funcs/funcs');
const Request = require('request');
const Consts = require('../consts');


module.exports = function(msg, args, author, channel, guild) {

    let langs = 'java, c, c99, cpp, cpp14, php, perl, python2, python3, ruby, go, scala, bash, sql, pascal, csharp, vbn, haskell, objc, swift, groovy, fortran, brainfuck, lua, tcl, hack, rust, d, ada, r, freebasic, verilog, cobol, dart, yabasic, clojure, nodejs, scheme, forth, prolog, octave, coffeescript, icon, fsharp, nasm, gccasm, intercal, unlambda, picolisp, spidermonkey, rhino, bc, clisp, elixir, factor, falcon, fantom, pike, smalltalk, mozart, lolcode, racket, kotlin, whitespace'.split(', ');

    function sendHelp() {
        return Embeds.sendEmbedError(channel, 
            'USAGE: `exec -l <language> [-stdin "<stdin>"] <code>`\n\n' +
            'Available languages: ```\n' + langs.join(', ') + '\n```');
    }

    if (args.length < 3) {
        return sendHelp();
    }

    let argstr = args.join(' ').replace(/\n/gm, '[<LINEBRAKE>]');
    let split = argstr.match(/(?:[^\s"]+|"[^"]*")+/g).map(e => e.replace(/\[<LINEBRAKE>\]/gm, '\n'));

    let language, stdin, script;
    
    let ilang = split.indexOf('-l');
    if (ilang < 0 || ilang == split.length - 1)
        return Embeds.sendEmbedError(channel, 'Invalid language.');
    language = split[ilang + 1].toLowerCase();
    if (!langs.includes(language))
        return Embeds.sendEmbedError(channel, 'Invalid language.');

    let istdin = split.indexOf('-stdin');
    if (istdin >= 0 && istdin < split.length - 1)
        stdin = split[istdin + 1];

    script = split.slice(!stdin ? 2 : 4).join(' ');

    if (script == '')
        return Embeds.sendEmbedError(channel, 'Invalid script.');


    let reqBody = {
        clientId: Main.config.jdoodle.client,
        clientSecret: Main.config.jdoodle.token,
        script,
        language,
    };

    if (stdin != '')
        reqBody.stdin = stdin;

    msg.delete();

    return Embeds.sendEmbed(channel, 'Executing...').then(m => {
        let options = {
            uri: 'https://api.jdoodle.com/v1/execute',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reqBody)
        };
    
        Request(options, (err, res, body) => {
            let embed = Embeds.getEmbed('', 'Exec Result');
            body = JSON.parse(body);
            if (body.error) {
                embed
                    .addField('Code', '```' + language + '\n' + script + '\n```')
                    .addField('Error', '```\n' + body.error + '\n```')
                    .setColor(Consts.COLORS.ERROR);
            }
            else {
                embed
                    .addField('Code', '```' + language + '\n' + script + '\n```')
                    .addField('Output', '```\n' + body.output + '\n```')
                    .setFooter(`CPU Time: ${body.cpuTime} | Memory: ${body.memory}`);
            }
            m.edit('', embed);
        });
    });

};