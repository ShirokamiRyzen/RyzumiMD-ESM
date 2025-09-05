import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix, text, command }) => {
  try {
    if (!text) throw `Contoh:\n${usedPrefix + command} https://mega.nz/file/NnEA1DIT#GXPSel8LJk2mnp7E_i69OXkSGq-x_bLceIi63p3BNZk`

    const { data } = await axios.get(`${APIs.ryzumi}/api/downloader/mega?url=${encodeURIComponent(text)}`, { headers: { accept: 'application/json' } })
    const item = data?.result?.find(x => x.type === 'file') || data?.result?.[0]
    if (!item) return m.reply('Error: File tidak ditemukan')
    if (!item.link) return m.reply('Error: Link unduhan tidak tersedia')

    if (item.size >= 500_000_000) return m.reply('Error: ukuran file terlalu besar (Ukuran Max: 500MB)')

    m.reply(`*_Mohon tunggu sebentar..._*\n${item.name} sedang diproses...`)

    const ext = (item.name.split('.').pop() || '').toLowerCase()
    const mimeMap = {
      mp4: 'video/mp4',
      pdf: 'application/pdf',
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      apk: 'application/vnd.android.package-archive',
      mp3: 'audio/mpeg',
      wav: 'audio/wav'
    }
    const mimetype = mimeMap[ext] || 'application/octet-stream'

    conn.sendMessage(
      m.chat,
      { document: { url: item.link }, mimetype, filename: item.name },
      { quoted: m }
    )
  } catch (error) {
    console.log(error)
    return m.reply(`Error: ${error?.message || error}`)
  }
}

handler.help = ['mega']
handler.tags = ['downloader']
handler.command = /^(mega)$/i

handler.limit = true
handler.register = true

export default handler
