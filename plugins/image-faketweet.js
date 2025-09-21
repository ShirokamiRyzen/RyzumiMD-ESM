import axios from 'axios'
import { uploadPomf } from '../lib/uploadImage.js'

const handler = async (m, { conn, args, usedPrefix, command }) => {
	if (args.length < 1 && !(m.quoted && m.quoted.text)) {
		throw `Gunakan format: ${usedPrefix || '.'}${command} <name>|<username>|<tweet>\n\nContoh:\n${usedPrefix || '.'}${command} Ryzumi|ryzumi_starlette|Halo, ini adalah tweet!!`;
	}

	let [nameArg, usernameArg, tweetArg] = args.join(' ').split('|');

	// Fallbacks
	const displayName = nameArg?.trim() || (await conn.getName(m.sender));
	const username = (usernameArg?.trim()) || displayName.replace(/\s+/g, '_').toLowerCase();
	let tweet = (tweetArg && tweetArg.trim()) || (m.quoted && m.quoted.text) || '';
	if (!tweet) throw `Teks tweet kosong. Tuliskan setelah tanda | atau reply teks.`;

	// Avatar otomatis
	const avatar = await conn.profilePictureUrl(m.sender, 'image').catch(_ => './src/avatar_contact.png');

	// Cek apakah ada gambar
	let imageUrl = '';
	try {
		const q = m.quoted ? m.quoted : m;
		const mime = (q.msg || q).mimetype || '';
		if (/^image\//i.test(mime)) {
			const media = await q.download();
			imageUrl = await uploadPomf(media);
		}
	} catch (e) {
		m.reply('_Gagal mengambil gambar_');
	}

	// Random metrics
	const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
	const retweets = rand(200, 1000);
	const comment = rand(200, 1000);
	const likes = rand(500, 2000);

	// Build URL
	const base = `${APIs.ryzumi}/api/image/faketweet`;
	const params = new URLSearchParams();
	params.set('bg', 'dim');
	params.set('avatar', avatar);
	params.set('name', displayName);
	params.set('username', username);
	params.set('tweet', tweet);
	params.set('retweets', String(retweets));
	params.set('comment', String(comment));
	params.set('likes', String(likes));
	params.set('verified', 'true');
	if (imageUrl) params.set('image', imageUrl);

	const url = `${base}?${params.toString()}`;

	const response = await axios.get(url, { responseType: 'arraybuffer' });
	const buffer = Buffer.from(response.data);
	await conn.sendFile(m.chat, buffer, 'faketweet.png', '', m);
}

handler.help = ['faketweet']
handler.tags = ['maker']
handler.command = /^(faketweet)$/i

handler.register = true

export default handler
