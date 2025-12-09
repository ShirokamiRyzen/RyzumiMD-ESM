import fetch from 'node-fetch'
import { uploadPomf } from '../lib/uploadImage.js'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    const arg = (text || '').trim().split(/\s+/)[0]
    let scale = Number(arg)
    if (!arg) {
      scale = 2
    } else if (!Number.isInteger(scale) || ![1, 2, 3, 4].includes(scale)) {
      return m.reply(
        `Pilihan tidak valid.\nGunakan angka 1-4.\nContoh:\n• ${usedPrefix + command} 2\n• ${usedPrefix + command} 4`
      )
    }

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    await conn.getName(who)

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime) throw 'Kirim/Reply Gambar dengan caption .upscale <1|2|3|4>'



    let media = await q.download()
    let url = await uploadPomf(media)

    const apiUrl = `https://api.siputzx.my.id/api/tools/upscale?url=${encodeURIComponent(url)}&scale=${scale}`

    const response = await fetch(apiUrl)
    if (!response.ok) {
      const txt = await response.text().catch(() => '')
      throw new Error(`Upscale gagal (${response.status}). ${txt || ''}`.trim())
    }

    const hasil = Buffer.from(await response.arrayBuffer())

    await conn.sendFile(m.chat, hasil, 'hasil.png', global.wm, m)
  } catch (error) {
    console.error(error)
    m.reply('Internal server error')
  }
}

handler.help = ['upscale']
handler.tags = ['ai']
handler.command = /^(hd|upscale)$/i

handler.register = true
handler.limit = 10

export default handler
