var Main = require('../main');
var Embeds = require('../funcs/embeds');
var Funcs = require('../funcs/funcs');

function getProfile(memb) {
	return new Promise((resolve, reject) => {
		Main.mysql.query('SELECT * FROM profiles WHERE uid = ?', memb.id, (err, res) => {
			if (err) {
				reject(err);
				return;
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
			'INSERT IGNORE INTO profiles (uid, bio) VALUES (?, ?)',
			[memb.id, bio], (err, res) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(res);
			}
		);
	});
}

module.exports = function(msg, args, author, channel, guild) {

	switch (args[0]) {

		case 'bio':
			m.delete();
			if (!args[1]) {
				Embeds.sendEmbedError(channel, 'Please set a text for your bio!');
				return;
			}
			setBio(author, args.slice(1).join(' ')).then(() => {
				Embeds.sendEmbed(channel, 'Bio set.')
					.then((m) => m.delete(3500));
			}).catch((err) => {
				if (err == 'LINK') {
					Embeds.sendEmbedError(channel, 'No links allowed in bio text!');
				} else {
					Embeds.sendEmbedError(channel, 'An unexpected error occured: ```\n' + err + '\n```');
				}
			});
			break;

		default:
			let memb = author;
			console.log(res);
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
				channel.send('', emb);
			});
	}

}