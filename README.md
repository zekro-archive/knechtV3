 <div align="center">
     <!-- <img src="http://zekro.de/zb2/src/logo_github.png" width="200"/> -->
     <h1>~ Knecht V3 ~</h1>
 <strong>Management bot of <a href="http://discord.zekro.de">zekro's Dev Discord</a></strong><br><br>
     <img src="https://forthebadge.com/images/badges/made-with-javascript.svg" height="30" />&nbsp;
     <img src="https://forthebadge.com/images/badges/built-with-love.svg" height="30" />&nbsp;
     <a href="https://zekro.de/discord"><img src="https://img.shields.io/discord/307084334198816769.svg?logo=discord&style=for-the-badge" height="30"></a>
     <br>
     <br>
     <a href="https://travis-ci.org/zekroTJA/knechtV3"><img src="https://travis-ci.org/zekroTJA/knechtV3.svg?branch=master"></a>
 </div>

---

# Information

This is a very powerful administration bot for my [development Discord](https://zekro.de/dc) making the life of the staff and administration team way easier. Below, you can learn more about specific funtions of this bot:

### User Bot Management System

Simply by a command, users can invite their own bots to the server by passing the ID of the bot and the Open Source repository. After executing, the bot will automatically generate an invite link and sends it as acception message with reactions into the administrators text channel. Then, the bot will reviewed real quick by the passed repository and either accepted or rejected. If the bot is getting accepted and the invite is proceed by an admin, the bot will automatically get the `User Bot` role, the owner *(= sender of the invite command)* will receive the `Bow Owner` role and the bot will be connected with the onwer in the internal data base.  
Also, every bot needs to have a specific, unique prefix, which needs to be set by the `prefix` command. With the `prefix` or `bot` command, every user can list all user bots on the guild with their owners and prefixes, they should react to. Also, the bot checks and displays the uptime of the bots.  
As well, Knecht handles if the bot leaves the discord to remove the owners `Bot Owner` role. Vice versa Knehct will kick all user bots of an onwer, if they left the Discord.

### User Moderation and Logging

Of course, Knecht also has functions to report, mute *(in text channels)*, kick and ban members. The victims will be notified over DM, all actions will be logged in a defined log text cnannel and registered in the internal database. Also, all logs can be accessed over a web interface. 

### Dev Roles

Using the `dev` command or the reactions in the `#channelselect` channel, users can add and remove specific theme roles like dev languages or technique roles, which will automatically give access to corresponding text channels.



---

# Commands & Functions

[👉 **List of commands**](https://github.com/zekroTJA/knechtV3/wiki/Commands)

---

# Database API

[👉 **Database API Docs**](https://github.com/zekroTJA/knechtV3/wiki/Database-API)

---

# 3rd Party Dependencies

- [discord.js](https://npmjs.com/package/discord.js)
- [discordjs-cmds](https://npmjs.com/package/discordjs-cmds)
- [acceptmessage](https://npmjs.com/package/acceptmessage)
- [mysql](https://npmjs.com/package/mysql)
- [express](https://npmjs.com/package/express)
- [express-handlebars](https://npmjs.com/package/express-handlebars)
- [body-parser](https://npmjs.com/package/body-parser)
- [request](https://npmjs.com/package/request)
