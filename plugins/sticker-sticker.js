let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image|video|webp/.test(mime)) {
    return m.reply('Reply gambar, video atau stiker untuk membuat sticker.')
  }

  if (/image|video|webp/.test(mime)) {
    // Treat GIFs as videos (WhatsApp sends them as mp4); guard for missing metadata
    const isVideoLike = /video|gif/.test(mime) || (q.mediaType === 'videoMessage')
    const seconds = Number(q.msg?.seconds || q.seconds || q.duration || 0)
    if (isVideoLike && seconds > 10) {
      return m.reply('Video harus berdurasi di bawah 10 detik.')
    }

    let media = await q.download()
    let exif
    if (text) {
      const [packname, author] = text.split(/[,|\-+&]/)
      // Correct keys expected by writeExif: packName, packPublish
      exif = { packName: packname?.trim() || '', packPublish: author?.trim() || '' }
    }
    return conn.sendSticker(m.chat, media, m, exif)
  }
  return m.reply('Kirim atau reply media untuk dijadikan stiker.')
}

handler.help = ['maker']
handler.tags = ['maker']
handler.command = /^s(tic?ker)?(gif)?$/i
handler.register = true

export default handler