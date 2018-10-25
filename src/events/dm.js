const Main = require('../main');
const AcceptMessage = require('acceptmessage');
const Embeds = require('../funcs/embeds');


function sendMessage(text, user) {
    let tag = user ? user.tag : 'anonymous';
    let id = user ? user.id : 'anonymous';
    Main.mysql.query('INSERT INTO submissions (date, tag, id, text) VALUES (?, ?, ?, ?)',
                     [new Date(), tag, id, text]);
}


Main.client.on('message', (msg) => {
    if (msg.channel.type != 'dm' || msg.author.id == Main.client.user.id) {
        return;
    }

    var author = msg.author;
    var channel = msg.channel;
    var content = msg.content;

    new AcceptMessage(Main.client, {
        content: Embeds.getEmbed('Klick 🔵 to sen your messsage anonymously or ✅ to send your message with your discord name tag.'),
        deleteMessage: true,
        emotes: {
            accept: '🔵',
            deny:   '✅'
        },
        actions: {
            accept: () => {
                sendMessage(content);
                Embeds.sendEmbed(channel, 'Your message was sent anonymously. Thank you for your submission!');
            },
            deny: () => {
                sendMessage(content, author);
                Embeds.sendEmbed(channel, 'Your message was sent. Thank you for your submission!');
            }
        }
    }).send(channel);
});