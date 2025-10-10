import * as Jimp from 'jimp'

let handler = async (m, { conn, text }) => {
	let src
	if (m.mediaType === 'imageMessage') {
		src = await m.download()
	} else if (/image/i.test(m.quoted?.mediaType)) {
		src = await m.quoted.download()
	} else if (m.mentionedJid?.[0]) {
		const jid = conn.getJid(String(m.mentionedJid[0]).decodeJid())
		src = await conn.profilePictureUrl(jid, 'image').catch(() => null)
	} else {
		const jid = conn.getJid(String(m.quoted?.sender || m.sender).decodeJid())
		src = await conn.profilePictureUrl(jid, 'image').catch(() => null)
	}

	if (!src) throw `Couldn't fetch the required image`

	// Parse blur level safely
	let level = parseInt(String(text || '5').trim(), 10)
	if (Number.isNaN(level)) level = 5
	level = Math.max(1, Math.min(100, level))

	// Read and blur
	const img = await Jimp.read(src)
	img.blur(level)
	const mime = Jimp.MIME_JPEG || 'image/jpeg'
	const buffer = await img.getBufferAsync(mime)

	// Send as image
	await conn.sendMessage(m.chat, { image: buffer }, { quoted: m })
}

handler.help = ['blur']
handler.tags = ['ai']
handler.command = /^(blur)$/i

handler.register = true

export default handler
