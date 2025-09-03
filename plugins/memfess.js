import { uploadPomf } from '../lib/uploadImage.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  conn.menfess = conn.menfess || {}

  if (!text) throw `*Cara penggunaan :*\n\n${usedPrefix + command} nomor|nama pengirim|pesan\n\n*Note:* nama pengirim boleh samaran/anonymous.\n\n*Contoh:* ${usedPrefix + command} ${m.sender.split('@')[0]}|Anonymous|Hai.`
  let [jid, name, pesan] = text.split('|')
  if (!jid || !name || !pesan) throw `*Cara penggunaan :*\n\n${usedPrefix + command} nomor|nama pengirim|pesan\n\n*Contoh:* ${usedPrefix + command} ${m.sender.split('@')[0]}|Anonymous|Hai.`

  jid = jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  let data = (await conn.onWhatsApp(jid))[0] || {}
  if (!data.exists) throw 'Nomer tidak terdaftar di whatsapp.'
  if (jid === m.sender) throw 'tidak bisa mengirim pesan menfess ke diri sendiri.'

  let mf = Object.values(conn.menfess).find(v => v.status === true)
  if (mf) return !0

  let id = Date.now()
  let teks = `Hai, kamu menerima pesan Menfess nih.\n\nDari: *${name}*\nPesan:\n${pesan}\n\nMau balas pesan ini kak? Tinggal ketik pesan kakak lalu kirim, nanti saya sampaikan ke *${name}*.`.trim()

  // cek media (reply / lampiran)
  let q = m.quoted ? m.quoted : m
  let mediaUrl = null
  if (q && typeof q.download === 'function') {
    try {
      let buf = await q.download()
      if (buf && Buffer.isBuffer(buf)) {
        mediaUrl = await uploadPomf(buf)
      }
    } catch {}
  }

  if (mediaUrl) {
    await conn.sendMessage(jid, {
      image: { url: mediaUrl },
      caption: teks,
      contextInfo: {
        externalAdReply: {
          title: 'M E N F E S S',
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: true,
          thumbnailUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIyz1dMPkZuNleUyfXPMsltHwKKdVddTf4-A&usqp=CAU',
          sourceUrl: ''
        }
      }
    })
  } else {
    await conn.sendMessage(jid, {
      text: teks,
      contextInfo: {
        externalAdReply: {
          title: 'M E N F E S S',
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: true,
          thumbnailUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIyz1dMPkZuNleUyfXPMsltHwKKdVddTf4-A&usqp=CAU',
          sourceUrl: ''
        }
      }
    })
  }

  m.reply('Berhasil mengirim pesan menfess.')
  conn.menfess[id] = {
    id,
    dari: m.sender,
    nama: name,
    penerima: jid,
    pesan,
    status: false
  }
  return !0
}

handler.tags = ['memfess']
handler.help = ['mfs']
handler.command = /^(mfs|memfess|memfes|confes)$/i

handler.register = true
handler.private = true
handler.limit = 2

export default handler
