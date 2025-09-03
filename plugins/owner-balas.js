import { uploadPomf } from '../lib/uploadImage.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    conn.ownreply = conn.ownreply || {}

    // Validasi argumen
    if (!text) throw `*Cara penggunaan:*\n\n${usedPrefix + command} nomor|pesan\n\n*Contoh:* ${usedPrefix + command} ${m.sender.split('@')[0]}|Halo.`
    let [jidRaw, pesan] = text.split('|')
    if (!jidRaw || !pesan) throw `*Cara penggunaan:*\n\n${usedPrefix + command} nomor|pesan\n\n*Contoh:* ${usedPrefix + command} ${m.sender.split('@')[0]}|Halo.`

    // Normalisasi JID
    const target = jidRaw.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    const waCheck = await conn.onWhatsApp(target)
    const data = (waCheck && waCheck[0]) ? waCheck[0] : { exists: false, jid: target }
    if (!data.exists) throw 'Nomer tidak terdaftar di WhatsApp.'
    const to = data.jid || target

    const mf = Object.values(conn.ownreply).find(x => x && x.status === true)
    if (mf) return !0

    const id = Date.now()
    const mentionUser = to.split('@')[0]
    const caption = `Hai @${mentionUser}, kamu menerima pesan Dari: *Owner*\nPesan:\n${pesan}`.trim()
    const mentions = [to]

    try {
        const q = m.quoted ? m.quoted : m
        let sentWithMedia = false

        const maybeHasMedia =
            (q && typeof q.download === 'function') ||
            (q && (q.mimetype || q.message?.imageMessage || q.message?.videoMessage || q.message?.documentMessage))

        if (maybeHasMedia && typeof q.download === 'function') {
            try {
                const buf = await q.download()
                if (buf && Buffer.isBuffer(buf)) {
                    const url = await uploadPomf(buf)
                    await conn.sendMessage(to, {
                        image: { url: String(url) },
                        caption,
                        mentions,
                        contextInfo: { mentionedJid: mentions }
                    })
                    sentWithMedia = true
                    await m.reply('Berhasil mengirim pesan dengan media.')
                }
            } catch {
                sentWithMedia = false
            }
        }

        if (!sentWithMedia) {
            await conn.sendMessage(to, {
                text: caption,
                mentions,
                contextInfo: { mentionedJid: mentions }
            })
            await m.reply('Berhasil mengirim pesan.')
        }

        conn.ownreply[id] = {
            id,
            dari: m.sender,
            penerima: to,
            pesan,
            status: false
        }

        return !0
    } catch (err) {
        console.error('balas error:', err)
        throw 'Error'
    }
}

handler.help = ['balas']
handler.tags = ['owner']
handler.command = /^(balas|reply)$/i
handler.owner = true
handler.fail = null

export default handler
