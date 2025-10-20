import { areJidsSameUser } from '@whiskeysockets/baileys'

var handler = async (m, { conn, text, participants }) => {
    const rawWho = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]) || (text ? (text.replace(/\D/g, '') + '@s.whatsapp.net') : '')
    if (!rawWho) throw 'Reply / tag yang ingin di kick'

    const who = typeof conn.getJid === 'function' ? conn.getJid(rawWho) : (rawWho.decodeJid ? rawWho.decodeJid() : rawWho)

    if (areJidsSameUser(who, m.sender)) throw 'Reply / tag yang ingin di kick'

    const parts = participants
        .map(p => p?.id || p?.jid || p?.participant || p?.lid)
        .filter(Boolean)
        .map(raw => ({ raw, norm: (typeof conn.getJid === 'function' ? conn.getJid(raw) : (raw.decodeJid ? raw.decodeJid() : raw)) }))

    const matched = parts.find(p => areJidsSameUser(p.norm, who))
    if (!matched) throw `Target tidak berada dalam Grup !`

    await conn.groupParticipantsUpdate(m.chat, [matched.raw], 'remove')
    m.reply(`Success`)
}

handler.help = ['kick'].map(v => v + ' @user')
handler.tags = ['group']
handler.command = /^(kick)$/i

handler.owner = false
handler.group = true
handler.botAdmin = true
handler.admin = true

export default handler