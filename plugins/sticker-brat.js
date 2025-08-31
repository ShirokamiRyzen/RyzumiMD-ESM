import fetch from 'node-fetch'
import { Sticker } from 'wa-sticker-formatter'

let handler = async (m, { conn, text }) => {
  if (!text || !text.trim()) throw 'Masukkan teks yang valid!'

  try {
    let url = `${APIs.ryzumi}/api/image/brat?text=${encodeURIComponent(text.trim())}`

    // Fetch gambar
    let res = await fetch(url)
    if (!res.ok) throw `Gagal mengambil gambar dari API! Status: ${res.status}`

    // Ambil buffer gambar
    let imageBuffer = await res.buffer()

    let sticker = new Sticker(imageBuffer, {
      pack: global.stickpack,
      author: global.stickauth
    })

    await conn.sendFile(m.chat, await sticker.toBuffer(), 'sticker.webp', '', m, { asSticker: true })

  } catch (err) {
    console.error('Error:', err.message || err)
    await conn.sendMessage(m.chat, { text: `Error: ${err.message || 'Gagal mengambil gambar.'}` }, { quoted: m })
  }
}

handler.help = ['brat']
handler.tags = ['sticker']
handler.command = /^(brat)$/i

handler.register = true

export default handler
