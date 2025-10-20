import { areJidsSameUser } from '@whiskeysockets/baileys'

let handler = async (m, { conn, participants, text }) => {
    const rawWho = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]) || (text ? (text.replace(/\D/g, '') + '@s.whatsapp.net') : '')
    if (!rawWho) throw 'Reply / tag yang ingin di demote'

    const who = typeof conn.getJid === 'function' ? conn.getJid(rawWho) : (rawWho.decodeJid ? rawWho.decodeJid() : rawWho)
    if (areJidsSameUser(who, m.sender)) throw 'Reply / tag yang ingin di demote'

    const parts = participants
        .map(p => p?.id || p?.jid || p?.participant || p?.lid)
        .filter(Boolean)
        .map(raw => ({ raw, norm: (typeof conn.getJid === 'function' ? conn.getJid(raw) : (raw.decodeJid ? raw.decodeJid() : raw)) }))

    const matched = parts.find(p => areJidsSameUser(p.norm, who))
    if (!matched) throw 'Target tidak berada dalam Grup !'

    await conn.groupParticipantsUpdate(m.chat, [matched.raw], 'demote')
    m.reply('Success')
}
handler.help = ['demote @tag']
handler.tags = ['group']
handler.command = /^(demote)$/i
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler