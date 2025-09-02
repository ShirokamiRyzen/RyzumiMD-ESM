let handler = async (m, { conn, text }) => {
  if (!m.quoted) throw 'Quoted the sticker!'
  try {
    let [packname, ...author] = text.split('|')
    author = (author || []).join('|')
    let mime = m.quoted.mimetype || ''
    if (!/webp/.test(mime)) throw 'Reply sticker!'
    let img = await m.quoted.download()
    if (!img) throw 'Reply a sticker!'
    conn.sendSticker(m.chat, img, m, { packname, author })
  } catch (e) {
    console.error(e)
  }
}
handler.help = ['wm <packname>|<author>']
handler.tags = ['sticker']
handler.command = /^wm$/i
handler.register = true
handler.premium = true

export default handler
