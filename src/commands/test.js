var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');
var Request = require('request');


const ARCHIVE = '495977734292635648';

const TO_ARCHIVE = {
    CATEGORIES: [
        "479542739621642250", // ETC
        "474865438614880256", // BETRIEBSSYSTEME
        "473513154089844737", // SPRACHEN
        "364538426764296193", // PROJEKTE
    ],
    CHANNELS: [
        "477438690134720513", // CHANNELSELECT
        "490945479824375808", // KARTOFFELSCRIPT
        "483656923263008768", // SPAM,
        "498488273316872193", // GER-VOTES
    ]
};

const TO_RENAME = {
    "473514796957040640": 'general',
    "473515057230118922": 'dev',
    "473513123807100928": 'important',
};

const TO_CREATE = [
    {
        name: "tech",
        parent: "473514629562105866", // GENERAL
    },
    {
        name: "hardware",
        parent: "473514629562105866", // GENERAL
    },
    {
        name: "trashtalk",
        parent: "473514629562105866", // GENERAL
    }
];

module.exports = function(msg, args, author, channel, guild) {

    if (!['221905671296253953', '98719514908188672'].includes(author.id)) {
        return
    }

    const STAFF = Main.config.staffrole;

    function moveToArchive(channel) {
        channel.setParent(ARCHIVE);
        channel.overwritePermissions(guild.id, {
            SEND_MESSAGES: false,
        });
        channel.overwritePermissions(STAFF, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: false
        });
    }

    function getChannel(id, cb) {
        let channel = guild.channels.get(channel_id);
        if (channel) {
            cb(channel);
        }
    }

    //////////////

    TO_ARCHIVE.CATEGORIES.forEach((category_id) => {
        let category = guild.channels.get(category_id);
        if (category && category.type == 'category') {
            category.children.forEach((child) => {
                moveToArchive(child);
            });
        }
        category.delete();
    })

    TO_ARCHIVE.CHANNELS.forEach((channel_id) => {
        getChannel(channel_id, moveToArchive)
    })

    Object.keys(TO_RENAME).forEach((channel_id) => {
        getChannel(channel_id, (chan) => {
            chan.setName(TO_RENAME[channel_id]);
        });
    })

    TO_CREATE.forEach((cobj) => {
        guild.createChannel(cobj.name, 'text').then((chan) => {
            chan.setParent(cobj.parent);
        });
    });
}