import axios from 'axios'

let handler = async (m, { conn, command, text }) => {
  if (!text || !text.trim()) throw 'Masukkan teks yang valid!'

  try {
    let end = '/api/image/brat?text='
    if (/vid|video/i.test(command)) {
      end = '/api/image/brat/animated?text='
    }
    let url = APIs.ryzumi + end + encodeURIComponent(text.trim())
    const { data } = await axios.get(url, { responseType: 'arraybuffer' })
    await conn.sendSticker(m.chat, data, m)
  } catch (err) {
    console.error('Error:', err)
    await m.reply(`Error: ${err.message || 'Gagal mengambil gambar.'}`)
  }
}

handler.help = ['brat', 'bratvid']
handler.tags = ['maker']
handler.command = /^(brat|brat(vid|video))$/i

handler.register = true

export default handler
