var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');
var request = require('request');
var AcceptMessage = require('acceptmessage');

function getProfile(memb) {
	return new Promise((resolve, reject) => {
		Main.mysql.query('SELECT * FROM profiles WHERE uid = ?', memb.id, (err, res) => {
			if (err) {
				reject(err);
				return;
			}
			if (res.length > 0) {
				res = res[0];
			}
			res.joinedAt = memb.joinedAt;
			res.createdAt = memb.createdAt;
			Main.mysql.query('SELECT * FROM reports WHERE victim = ?', memb.id, (err, repRes) => {
				if (err) {
					reject(err);
					return;
				}
				res.reports = repRes.length;
				resolve(res);
			});
		});
	});
}

function setBio(memb, bio) {
	const linkRx = /(https?:\/\/)?(www\.)?((\w)+\.)+([a-zA-Z]{2,}(?!\())(:\d+)?(\/\S+)?(?!\w)/gm;
	return new Promise((resolve, reject) => {
		if (bio.match(linkRx)) {
			reject('LINK');
			return;
		}
		Main.mysql.query(
			'INSERT INTO profiles (uid, bio) VALUES (?, ?) ON DUPLICATE KEY UPDATE bio = ?',
			[memb.id, bio, bio], (err, res) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(res);
			}
		);
	});
}

function setGitHub(memb, profileIdentifier) {
	return new Promise((resolve, reject) => {
		profileIdentifier = profileIdentifier.replace(/(https?:\/\/)?(www.)?github\.com\//gm, '');

		request({
			uri: 'https://api.github.com/users/' + profileIdentifier,
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'User-Agent': 'KnechtBot v3'
			}
		}, (err, res, body) => {
			if (err) {
				reject(err);
				return;
			}
			if (!body) {
				reject('EMPTY_BODY');
				return;
			}
			
			body = JSON.parse(body);

			if (body.message == 'Not Found') {
				reject('NOT_FOUND');
				return;
			}

			Main.mysql.query(
				'INSERT INTO profiles (uid, github) VALUES (?, ?) ON DUPLICATE KEY UPDATE github = ?',
				[memb.id, body.login, body.login], (err, res) => {
					if (err) {
						reject(err);
						return;
					}
					resolve(body.login);
				}
			);
		});
	});
}

function setArtwork(memb, url) {
	return new Promise((resolve, reject) => {
		if (!url.match(/\.(jpg|png|jpeg)$/gmi)) {
			reject('INVALID_FORMAT');
			return;
		}
		request(url, (err, res) => {
			if (err || !(res.statusCode == 200 || res.statusCode == 403)) {
				reject('NOT_FOUND');
				return;
			}
			let adminlog = memb.guild.channels.get(Main.config.adminlog);
			if (adminlog) {
				new AcceptMessage(Main.client, {
					channel: adminlog,
					content: Embeds.getEmbed(`Profile artwork request from ${memb} (${memb.user.tag}):`)
						.setImage(url),
        			emotes: {
        			    accept: '✅',
        			    deny:   '❌'
        			},
        			actions: {
        			    accept: (reaction, user) => {
							Embeds.sendEmbed(adminlog, `Profile artwork request got accepted by ${user}.`);
							Main.mysql.query(
								'INSERT INTO profiles (uid, artwork) VALUES (?, ?) ON DUPLICATE KEY UPDATE artwork = ?',
								[memb.id, url, url]
							);
        			    },
        			    deny: (reaction, user) => {
        			        Embeds.sendEmbedError(adminlog, `Profile artwork request got denied by ${user}.`);
        			    }
        			}
				}).send();
			}
			resolve();
		});
	});
}

module.exports = function(msg, args, author, channel, guild) {

	switch (args[0]) {

		case 'bio':
			msg.delete();
			if (!args[1]) {
				Embeds.sendEmbedError(channel, 'Please set a text for your bio!');
				return;
			}
			setBio(author, args.slice(1).join(' ')).then(() => {
				Embeds.sendEmbed(channel, 'Bio set.')
					.then((m) => m.delete(3500));
			}).catch((err) => {
				if (err == 'LINK') {
					Embeds.sendEmbedError(channel, 'No links allowed in bio!')
						.then((m) => m.delete(3500));
				} else {
					Embeds.sendEmbedError(channel, 'An unexpected error occured: ```\n' + err + '\n```');
				}
			});
			break;

		case 'github':
			msg.delete();
			if (!args[1]) {
				Embeds.sendEmbedError(channel, 'Please enter a GitHub username or url!');
				return;
			}
			setGitHub(author, args[1]).then((uname) => {
				Embeds.sendEmbed(channel, 'GitHub profile set.')
					.then((m) => m.delete(3500));
			}).catch((err) => {
				if (err == 'NOT_FOUND') {
					Embeds.sendEmbedError(channel, `GitHub user with name \`${args[0]}\` was not found!`)
						.then((m) => m.delete(3500));
				} else if (err == 'EMPTY_BODY') {
					Embeds.sendEmbedError(channel, 'Username check response body was empty!')
						.then((m) => m.delete(3500));
				} else {
					Embeds.sendEmbedError(channel, 'An unexpected error occured: ```\n' + err + '\n```')
						.then((m) => m.delete(3500));
				}
			});
			break;

		case 'artwork':
		case 'image':
			msg.delete();
			if (!args[1]) {
				Embeds.sendEmbedError(channel, 'Please enter an image URL!');
				return;
			}
			setArtwork(author, args[1]).then(() => {
				Embeds.sendEmbed(channel, 'Artwork image URLs needs to be checked by an admin manually. The artwork will be set to your profile after an admin accepted the request. Please be patient.');
			}).catch((err) => {
				if (err == 'INVALID_FORMAT') {
					Embeds.sendEmbedError(channel, 'Invalid image format. Image needs to be `jpg`, `png` oder `jpeg`!');
				} else if (err == 'NOT_FOUND') {
					Embeds.sendEmbedError(channel, 'Invalid image URL!');
				} else {
					Embeds.sendEmbedError(channel, 'An unexpected error occured: ```\n' + err + '\n```')
				}
			});
			break;

		case 'reset':
		case 'delete': 
			new AcceptMessage(Main.client, {
				content: Embeds.getEmbed('Do you really want to reset **all** of your profile settings?'),
				emotes: {
					accept: '✅',
					deny:   '❌'
				},
				actions: {
					accept: () => {
						Main.mysql.query('DELETE FROM profiles WHERE uid = ?', author.id);
						Embeds.sendEmbed(channel, 'Profile settings reseted.');
					},
					deny: () => {
						Embeds.sendEmbedError(channel, 'Canceled.');
					}
				}
			}).send(channel);
			break;

		default:
			let memb = author;
			if (args[0]) {
				memb = Funcs.fetchMember(guild, args[0], false);
			}
			getProfile(memb).then((res) => {
				let emb = Embeds.getEmbed('', 'Profile of ' + memb.user.tag)
					.addField('Name', `${memb.displayName} (${memb.user.username})`)
					.addField('UID', '```' + memb.id + '```')
					.addField('Bio', res.bio ? res.bio : '*No bio set.*')
					.addField('Guild Member Since', Funcs.getTime(res.joinedAt))
					.addField('Discord Account Existing Since', Funcs.getTime(res.createdAt))
					.addField('GitHub Profile', res.github ? `:github:  [**${res.github}**](https://github.com/${res.github})` : '*No GitHub profile set.*')
					.addField('Reports', 
						res.reports > 0 
						? `This user has **${res.reports}** on record.\n*See all reports details with \`!rep list\` command.*`
						: 'This user has a white west.')
					;
				if (memb.user.avatarURL) {
					emb.setThumbnail(memb.user.avatarURL);
				}
				if (res.artwork) {
					emb.setImage(res.artwork);
				}
				return channel.send('', emb);
			});
	}

}