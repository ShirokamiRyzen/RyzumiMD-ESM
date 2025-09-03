import { uploadPomf } from '../lib/uploadImage.js'

export async function before(m) {
    if (!m.chat.endsWith('@s.whatsapp.net')) return !0

    const raw = m.message || {}
    const mtype = m.mtype || (Object.keys(raw)[0] || '')
    const isSystem =
        mtype === 'protocolMessage' ||
        !!raw.protocolMessage ||
        !!m.messageStubType ||
        !!raw.senderKeyDistributionMessage ||
        !!raw.extendedTextMessage?.contextInfo?.disappearingMode
    if (isSystem) return !0

    this.menfess = this.menfess || {}
    const mf = Object.values(this.menfess).find(v => v.status === false && v.penerima === m.sender)
    if (!mf) return !0

    const bodyText = (m.text || '').trim()

    let q = null
    if (m.quoted && typeof m.quoted.download === 'function') q = m.quoted
    else if (typeof m.download === 'function') q = m

    let mediaUrl = null
    if (q) {
        try {
            const buf = await q.download()
            if (buf && Buffer.isBuffer(buf)) {
                mediaUrl = await uploadPomf(buf)
            }
        } catch { }
    }

    if (!bodyText && !mediaUrl) return !0

    let caption = `Hai kak, kamu menerima balasan nih.\n\n`
    if (bodyText) caption += `Pesan balasannya:\n${bodyText}\n`

    if (mediaUrl) {
        await this.sendMessage(mf.dari, {
            image: { url: String(mediaUrl) },
            caption
        })
    } else {
        await this.sendMessage(mf.dari, { text: caption })
    }

    await m.reply('Balasan Memfess terkirim.')
    await this.delay(1000)
    delete this.menfess[mf.id]
    return !0
}
