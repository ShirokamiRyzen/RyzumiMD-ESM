import * as Jimp from 'jimp'

const { Jimp: J } = Jimp

async function resolveImageToBuffer(input) {
	if (Buffer.isBuffer(input)) return input
	if (typeof input === 'string') {
		const res = await fetch(input)
		const arr = await res.arrayBuffer()
		return Buffer.from(arr)
	}
	throw new Error("Unsupported image source")
}

let handler = async (m, { conn, text }) => {
	let image =
		m.message?.imageMessage ? await m.download()
			: /image/.test(m.quoted?.mediaType) ? await m.quoted.download()
				: m.mentionedJid?.[0] ? await conn.profilePictureUrl(m.mentionedJid[0], 'image')
					: await conn.profilePictureUrl(m.quoted?.sender || m.sender, 'image')

	if (!image) throw `Couldn't fetch the required Image`

	const level = isNaN(text) ? 5 : parseInt(text)
	const imgBuf = await resolveImageToBuffer(image)

	const img = await J.read(imgBuf)
	img.blur(level)

	const out = await img.getBufferAsync('image/jpeg')
	await m.reply(out)
}

handler.help = ['blur']
handler.tags = ['ai']
handler.command = /^(blur)$/i

handler.register = true

export default handler
