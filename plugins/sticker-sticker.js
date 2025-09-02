let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image|video|webp/.test(mime)) {
    return m.reply('Reply gambar, video atau stiker untuk membuat sticker.')
  }

  if (/image|video|webp/.test(mime)) {
    if (mime.includes('video') && q.msg.seconds > 10) {
      return m.reply('Video harus berdurasi di bawah 10 detik.')
    }

    let media = await q.download()
    let exif;
    if (text) {
    let [packname, author] = text.split(/[,|\-+&]/);
    exif = { packname: packname ? packname : '', packnublish: author ? author : '' };
    }
    return conn.sendSticker(m.chat, media, m, exif)
  }
  return m.reply('Kirim atau reply media untuk dijadikan stiker.')
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = /^s(tic?ker)?(gif)?$/i
handler.register = true

export default handler