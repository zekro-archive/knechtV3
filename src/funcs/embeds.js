var { RichEmbed } = require('discord.js');
var Consts = require('../consts')


function sendEmbedError(chan, description, title) {
    return chan.send('', getEmbed(description, title, true));
}

function getEmbed(description, title, err) {
    let emb = new RichEmbed()
        .setDescription(description)
        .setColor(err ? Consts.COLORS.ERROR : Consts.COLORS.MAIN);
    if (title)
        emb.setTitle(title);
    return emb
}

function sendEmbed(chan, description, title) {
    return chan.send('', getEmbed(description, title));
}


module.exports = {
    getEmbed,
    sendEmbed,
    sendEmbedError
}