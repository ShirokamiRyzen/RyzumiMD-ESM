import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix, command }) => {
	if (!args[0]) throw `Usage: ${usedPrefix + command} <url>`
	m.reply(wait)

	try {
		const { data } = await axios.get(`${APIs.ryzumi}/api/downloader/soundcloud?url=${encodeURIComponent(args[0])}`)
		const { title, thumbnail, filesize, download_url } = data || {}

		if (!download_url || !title) throw 'Failed to fetch SoundCloud data. Please verify the URL.'

	      conn.sendMessage(m.chat, {
			document: { url: download_url },
			mimetype: 'audio/mpeg',
			fileName: `${title}.mp3`,
			caption: `
*Title:* ${title}
*Filesize:* ${filesize || '-'} bytes
*Thumbnail:* ${thumbnail || '-'}
*Source:* ${args[0]}
			`.trim(),
		}, { quoted: m })
	} catch (err) {
		console.error(err)
		throw `Error: ${err?.message || err}`
	}
}

handler.help = ['soundcloud <url>']
handler.tags = ['downloader']
handler.command = /^(soundcloud(dl)?|sc(dl)?)$/i
handler.limit = 2
handler.register = true

export default handler
